"""FastAPI backend for live XDP DDoS monitoring dashboard."""

import asyncio
import contextlib
import json
import os
import socket
import struct
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from data_manager import data_manager
from models import BlockedIPsList, CurrentMetrics, LogResponse

STATS_MAP = "stats_map"
BLOCK_MAP = "blocklist_map"
POLL_INTERVAL_SECONDS = 1

ROOT_DIR = Path(__file__).resolve().parents[1]
BLOCKED_LOG_FILE = ROOT_DIR / "blocked_ips.log"
RUNTIME_LOG_DIR = ROOT_DIR / "runtime-logs"
STATS_LOG = RUNTIME_LOG_DIR / "terminal1_stats_reader.log"
IPERF_LOG = RUNTIME_LOG_DIR / "terminal3_iperf_server.log"


app = FastAPI(
    title="XDP DDoS Backend",
    description="Real-time XDP DDoS monitoring.",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, payload: dict):
        stale = []
        for conn in self.active:
            try:
                await conn.send_json(payload)
            except Exception:
                stale.append(conn)
        for conn in stale:
            self.disconnect(conn)


ws_manager = ConnectionManager()
prev_counters = {}
terminal_log_offsets: Dict[str, int] = {}
collector_task = None


def int_to_ip(ip_int: int) -> str:
    return socket.inet_ntoa(struct.pack("!I", ip_int))


def run_bpftool_dump(map_name: str) -> List[dict]:
    candidates = [
        ["bpftool", "map", "dump", "name", map_name, "-j"],
        ["sudo", "-n", "bpftool", "map", "dump", "name", map_name, "-j"],
    ]
    for cmd in candidates:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0 or not result.stdout.strip():
            continue
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            continue
    return []


def parse_stats_map(entries: List[dict]) -> List[dict]:
    """Parse stats_map entries."""
    parsed = []
    for entry in entries:
        try:
            key = bytes(int(x, 16) for x in entry["key"])
            val = bytes(int(x, 16) for x in entry["value"])
            ip_int = struct.unpack("!I", key)[0]
            packets, bytes_total = struct.unpack("<QQ", val)
            parsed.append({
                "ip": int_to_ip(ip_int),
                "packets": packets,
                "bytes": bytes_total,
            })
        except Exception:
            continue
    return parsed


def parse_blocklist_map(entries: List[dict]) -> List[str]:
    """Parse blocklist_map entries."""
    blocked = []
    for entry in entries:
        try:
            key = bytes(int(x, 16) for x in entry["key"])
            ip_int = struct.unpack("!I", key)[0]
            blocked.append(int_to_ip(ip_int))
        except Exception:
            continue
    return blocked


def read_file_tail(file_path: Path, lines: int = 200) -> List[str]:
    """Read last N lines from a file."""
    if lines < 1 or lines > 5000:
        lines = 200
    if not file_path.exists():
        return []

    with file_path.open("r", encoding="utf-8", errors="ignore") as f:
        rows = [row.rstrip("\n") for row in f]
    return rows[-lines:]


def infer_log_level(line: str) -> str:
    upper = line.upper()
    if "ERROR" in upper or "FAILED" in upper:
        return "ERROR"
    if "ATTACK" in upper or "BLOCK" in upper or "DROP" in upper:
        return "WARNING"
    return "INFO"


def ingest_logs():
    """Ingest terminal logs into data_manager."""
    for source, file_path in [("stats_reader", STATS_LOG), ("iperf_server", IPERF_LOG)]:
        if not file_path.exists():
            continue

        offset = terminal_log_offsets.get(source, 0)
        with file_path.open("r", encoding="utf-8", errors="ignore") as f:
            f.seek(offset)
            new_lines = f.readlines()
            terminal_log_offsets[source] = f.tell()

        for raw_line in new_lines[-200:]:
            line = raw_line.strip()
            if line:
                data_manager.log(infer_log_level(line), f"[{source}] {line}")


async def collector_loop():
    """Poll BPF maps and ingest logs every POLL_INTERVAL_SECONDS."""
    data_manager.log("INFO", "Collector started")

    while True:
        try:
            # Poll BPF maps
            stats_entries = run_bpftool_dump(STATS_MAP)
            block_entries = run_bpftool_dump(BLOCK_MAP)

            blocked_ips = parse_blocklist_map(block_entries)
            data_manager.sync_blocked_from_map(blocked_ips)

            # Read blocked_ips.log for sync
            if BLOCKED_LOG_FILE.exists():
                with BLOCKED_LOG_FILE.open("r") as f:
                    log_lines = [line.strip() for line in f if line.strip()]
                data_manager.sync_blocked_from_log(log_lines)

            # Ingest terminal logs
            ingest_logs()

            # Process stats and update metrics
            total_pps = 0.0
            total_bps = 0.0
            any_attack = False

            for row in parse_stats_map(stats_entries):
                ip = row["ip"]
                packets = row["packets"]
                bytes_total = row["bytes"]

                if ip in prev_counters:
                    prev_pkt, prev_bytes = prev_counters[ip]
                    pps = max(0.0, (packets - prev_pkt) / POLL_INTERVAL_SECONDS)
                    bps = max(0.0, (bytes_total - prev_bytes) / POLL_INTERVAL_SECONDS)
                else:
                    pps = bps = 0.0

                prev_counters[ip] = (packets, bytes_total)

                blocked = ip in blocked_ips
                if blocked:
                    any_attack = True

                total_pps += pps
                total_bps += bps
                data_manager.upsert_flow(ip, pps, bps, packets, bytes_total, blocked)

            # Determine system status
            if any_attack:
                status = "UNDER_ATTACK"
            elif total_pps > 0:
                status = "MONITORING"
            else:
                status = "IDLE"

            data_manager.add_metric_totals(total_pps, total_bps, status)

            # Broadcast to WebSocket clients
            await ws_manager.broadcast({
                "type": "update",
                "metrics": data_manager.get_current_metrics().model_dump(),
                "top_flows": data_manager.get_live_flows(limit=10),
                "blocked_count": len(data_manager.get_active_blocked_ips()),
                "logs": [log.model_dump() for log in data_manager.get_logs(limit=20)],
                "timestamp": datetime.now().isoformat(),
            })

        except Exception as e:
            data_manager.log("ERROR", str(e))

        await asyncio.sleep(POLL_INTERVAL_SECONDS)


@app.on_event("startup")
async def startup():
    global collector_task
    RUNTIME_LOG_DIR.mkdir(parents=True, exist_ok=True)
    # Clear logs on startup
    for log_file in [STATS_LOG, IPERF_LOG]:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        log_file.write_text("")
    collector_task = asyncio.create_task(collector_loop())


@app.on_event("shutdown")
async def shutdown():
    global collector_task
    if collector_task:
        collector_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await collector_task


@app.get("/")
async def root():
    return {
        "service": "XDP DDoS Backend",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/api/metrics", response_model=CurrentMetrics)
async def metrics():
    return data_manager.get_current_metrics()


@app.get("/api/flows")
async def flows(limit: int = 100):
    return {
        "count": min(limit, len(data_manager.live_flows)),
        "flows": data_manager.get_live_flows(limit=limit),
    }


@app.get("/api/read-stats")
async def read_stats(lines: int = 200):
    """Read stats_reader terminal logs."""
    rows = read_file_tail(STATS_LOG, lines)
    return {
        "source": "stats_reader",
        "path": str(STATS_LOG),
        "line_count": len(rows),
        "lines": rows,
    }


@app.get("/api/read-iperf")
async def read_iperf(lines: int = 200):
    """Read iperf3 server terminal logs."""
    rows = read_file_tail(IPERF_LOG, lines)
    return {
        "source": "iperf_server",
        "path": str(IPERF_LOG),
        "line_count": len(rows),
        "lines": rows,
    }


@app.get("/api/blocked-ips")
async def blocked_ips(lines: int = 200):
    """Read blocked IPs from blocked_ips.log."""
    rows = read_file_tail(BLOCKED_LOG_FILE, lines)
    return {
        "path": str(BLOCKED_LOG_FILE),
        "line_count": len(rows),
        "blocked_ips": rows,
    }


@app.websocket("/ws/metrics")
async def ws_metrics(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except Exception:
        pass
    finally:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

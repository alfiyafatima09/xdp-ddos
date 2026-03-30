"""In-memory data store for live XDP dashboard data."""

from datetime import datetime
from typing import Dict, List

from models import BlockedIP, CurrentMetrics, LogEntry, MetricPoint


class DataManager:
    """Stores live metrics, per-IP flows, blocked IPs, and runtime logs."""

    def __init__(self):
        self.metrics_history: List[MetricPoint] = []
        self.max_history = 3600

        # ip -> latest snapshot
        self.live_flows: Dict[str, dict] = {}

        self.blocked_ips: Dict[str, BlockedIP] = {}
        self.logs: List[LogEntry] = []
        self.max_logs = 2000

        self.current_metrics = CurrentMetrics(
            pps=0.0,
            bps=0.0,
            timestamp=datetime.now().timestamp(),
            status="IDLE",
        )

    def log(self, level: str, message: str, source_ip: str = None):
        entry = LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level,
            message=message,
            source_ip=source_ip,
        )
        self.logs.append(entry)
        if len(self.logs) > self.max_logs:
            self.logs = self.logs[-self.max_logs :]

    def add_metric_totals(self, total_pps: float, total_bps: float, status: str):
        now_ts = datetime.now().timestamp()
        self.current_metrics = CurrentMetrics(
            pps=total_pps,
            bps=total_bps,
            timestamp=now_ts,
            status=status,
        )

        self.metrics_history.append(MetricPoint(timestamp=now_ts, pps=total_pps, bps=total_bps))
        if len(self.metrics_history) > self.max_history:
            self.metrics_history = self.metrics_history[-self.max_history :]

    def upsert_flow(self, ip_address: str, pps: float, bps: float, packets: int, bytes_total: int, blocked: bool):
        verdict = "ATTACK" if blocked else "NORMAL"
        self.live_flows[ip_address] = {
            "ip_address": ip_address,
            "pps": float(pps),
            "bps": float(bps),
            "packets": int(packets),
            "bytes": int(bytes_total),
            "verdict": verdict,
            "blocked": bool(blocked),
            "timestamp": datetime.now().isoformat(),
        }

    def sync_blocked_from_map(self, blocked_ip_list: List[str]):
        now_iso = datetime.now().isoformat()
        for ip in blocked_ip_list:
            if ip not in self.blocked_ips:
                self.blocked_ips[ip] = BlockedIP(
                    ip_address=ip,
                    timestamp=now_iso,
                    reason="Blocked in XDP blocklist map",
                    is_active=True,
                )
                self.log("WARNING", "IP is blocked in XDP map", source_ip=ip)

        for ip, blocked in self.blocked_ips.items():
            blocked.is_active = ip in set(blocked_ip_list)

    def sync_blocked_from_log(self, blocked_log_lines: List[str]):
        for line in blocked_log_lines:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 2:
                continue
            ts, ip = parts[0], parts[1]
            if ip not in self.blocked_ips:
                self.blocked_ips[ip] = BlockedIP(
                    ip_address=ip,
                    timestamp=ts,
                    reason="Logged by stats_reader",
                    is_active=True,
                )

    def get_current_metrics(self) -> CurrentMetrics:
        return self.current_metrics

    def get_metrics_history(self, minutes: int = 5) -> List[MetricPoint]:
        points = max(1, minutes * 60)
        return self.metrics_history[-points:]

    def get_live_flows(self, limit: int = 100) -> List[dict]:
        values = list(self.live_flows.values())
        values.sort(key=lambda x: x["pps"], reverse=True)
        return values[:limit]

    def get_blocked_ips(self) -> List[BlockedIP]:
        return list(self.blocked_ips.values())

    def get_active_blocked_ips(self) -> List[BlockedIP]:
        return [row for row in self.blocked_ips.values() if row.is_active]

    def get_logs(self, limit: int = 200) -> List[LogEntry]:
        return self.logs[-limit:]


# Global instance
data_manager = DataManager()

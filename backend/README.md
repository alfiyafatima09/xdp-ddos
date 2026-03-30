# XDP DDoS Backend

Real-time monitoring backend for XDP DDoS project.

## Running

```bash
cd backend
python main.py
```

Runs on: **http://localhost:8001**

API Docs: **http://localhost:8001/docs**

## Endpoints

### Health & Metrics

- `GET /api/health` - Health check
- `GET /api/metrics` - Current attack metrics (PPS, BPS, status)
- `GET /api/flows?limit=100` - Live per-IP flows

### Read Terminal Logs

- `GET /api/read-stats?lines=200` - Read stats_reader terminal logs
- `GET /api/read-iperf?lines=200` - Read iperf3 server terminal logs
- `GET /api/blocked-ips?lines=200` - Read blocked_ips.log entries

### Real-time Updates

- `WebSocket /ws/metrics` - Live stream of metrics, flows, logs

## Features

- **BPF Map Polling**: Reads `stats_map` and `blocklist_map` every 1 second
- **Live Terminal Logs**: Tails `terminal1_stats_reader.log` and `terminal3_iperf_server.log`
- **Blocked IPs**: Syncs from both BPF map and `blocked_ips.log`
- **WebSocket Broadcasting**: Sends full state to all connected clients every 1 second

## Log Files

All logs are stored in `runtime-logs/`:

- `terminal1_stats_reader.log` - stats_reader output
- `terminal3_iperf_server.log` - iperf3 server output

## Notes

- If bpftool needs elevated permissions, run backend with sudo or configure passwordless access for bpftool.
- `blocked_ips.log` is read from project root for blocked IP entries.

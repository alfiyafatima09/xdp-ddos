#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/runtime-logs"
LOG_FILE="$LOG_DIR/terminal3_iperf_server.log"

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting iperf3 server" | tee -a "$LOG_FILE"
cd "$ROOT_DIR"
stdbuf -oL -eL iperf3 -s 2>&1 | tee -a "$LOG_FILE"

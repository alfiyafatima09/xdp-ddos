#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/runtime-logs"
LOG_FILE="$LOG_DIR/terminal1_stats_reader.log"

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting stats_reader" | tee -a "$LOG_FILE"
cd "$ROOT_DIR"
# Ask for sudo once up front so it never appears as a silent hang.
sudo -v
sudo stdbuf -oL -eL .venv/bin/python -u userspace/stats_reader.py 2>&1 | tee -a "$LOG_FILE"
    
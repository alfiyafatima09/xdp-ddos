#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/runtime-logs"
LOG_FILE="$LOG_DIR/terminal2_xdp_loader.log"

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting XDP loader" | tee -a "$LOG_FILE"
cd "$ROOT_DIR"
sudo stdbuf -oL -eL ./scripts/load_xdp.sh 2>&1 | tee -a "$LOG_FILE"

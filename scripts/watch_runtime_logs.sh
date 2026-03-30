#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/runtime-logs"

mkdir -p "$LOG_DIR"

tail -n 50 -F \
  "$LOG_DIR/terminal1_stats_reader.log" \
  "$LOG_DIR/terminal2_xdp_loader.log" \
  "$LOG_DIR/terminal3_iperf_server.log"

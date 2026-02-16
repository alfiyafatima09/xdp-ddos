import subprocess
import time
import json
import socket
import struct

MAP_NAME = "stats_map"
INTERVAL = 1  # secs

prev = {}

def int_to_ip(ip_int):
    return socket.inet_ntoa(struct.pack("!I", ip_int))

def read_stats_map():
    cmd = ["bpftool", "-j", "map", "dump", "name", MAP_NAME]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else []

print("IP Address        PPS       BPS")
print("-----------------------------------")

while True:
    time.sleep(INTERVAL)

    entries = read_stats_map()

    for entry in entries:
        formatted = entry.get("formatted")
        if not formatted:
            continue

        key = formatted.get("key")
        value = formatted.get("value")

        if not isinstance(key, int) or not isinstance(value, dict):
            continue

        ip = int_to_ip(key)
        packets = value.get("packets")
        bytes_ = value.get("bytes")

        if ip not in prev:
            prev[ip] = (packets, bytes_)
            print(f"{ip:15}  {'-':>6}  {'-':>8}")
            continue

        p_prev, b_prev = prev[ip]
        pps = packets - p_prev
        bps = bytes_ - b_prev
        prev[ip] = (packets, bytes_)

        print(f"{ip:15}  {pps:6}  {bps:8}")

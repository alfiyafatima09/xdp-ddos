"""import subprocess
import time
import json
import socket
import struct
import joblib  # Required to load the ML model
import numpy as np

MAP_NAME = "stats_map"
BLOCK_MAP_NAME = "blocklist_map"
MODEL_PATH = "ddos_model.joblib"
INTERVAL = 1 

# Load the trained model from Phase 2
try:
    model = joblib.load(MODEL_PATH)
    print(f"[+] Loaded ML Model: {MODEL_PATH}")
except:
    print(f"[!] Model not found. Please run training script first.")
    model = None

prev = {}

def int_to_ip(ip_int):
    return socket.inet_ntoa(struct.pack("!I", ip_int))

def update_blocklist(ip_int):
    
    # Convert int IP to hex for bpftool
    hex_ip = hex(ip_int)
    cmd = ["sudo", "bpftool", "map", "update", "name", BLOCK_MAP_NAME, "key", hex_ip, "value", "01"]
    subprocess.run(cmd)

def read_stats_map():
    cmd = ["bpftool", "-j", "map", "dump", "name", MAP_NAME]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else []

print(f"{'IP Address':15} | {'PPS':8} | {'AvgSize':8} | {'Verdict'}")
print("-" * 50)

while True:
    time.sleep(INTERVAL)
    entries = read_stats_map()

    for entry in entries:
        formatted = entry.get("formatted")
        if not formatted: continue

        key = formatted.get("key")
        value = formatted.get("value")
        if not isinstance(key, int): continue

        ip = int_to_ip(key)
        packets = value.get("packets")
        bytes_ = value.get("bytes")

        if key in prev:
            p_prev, b_prev = prev[key]
            pps = (packets - p_prev) / INTERVAL
            bps = (bytes_ - b_prev) / INTERVAL
            avg_size = bps / pps if pps > 0 else 0

            # --- ML PHASE 2: INFERENCE ---
            if model:
                # Prepare features exactly as the model saw during training
                # Features: [Protocol(UDP=17), FlowDuration(1s), TotalPkts, TotalBytes, PPS, AvgSize]
                # Note: You may need to adjust these 6 features based on your specific training script
                features = np.array([[17, 1000000, pps, bps, pps, avg_size]])
                prediction = model.predict(features)

                if prediction[0] == 1:
                    verdict = "ATTACK"
                    update_blocklist(key) # Block it in Kernel!
                else:
                    verdict = "BENIGN"
            else:
                verdict = "No Model"

            print(f"{ip:15} | {pps:8.1f} | {avg_size:8.1f} | {verdict}")

        prev[key] = (packets, bytes_)
"""

import subprocess
import time
import json
import socket
import struct
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# --- CONFIGURATION ---
STATS_MAP = "stats_map"
BLOCK_MAP = "blocklist_map"
MODEL_PATH = "minimalist_ddos_model.joblib"
INTERVAL = 1.0 
LOG_FILE = "blocked_ips.log"  # file where blocked IPs will be saved

# Load the brain
try:
    model = joblib.load(MODEL_PATH)
    print(f"[*] Success: Loaded model with features: {model.feature_names_in_}")
except Exception as e:
    print(f"[!] Error: Could not load model. Did you run train_model.py first?\n{e}")
    exit(1)

prev_stats = {}
idle_cycles = 0

def int_to_ip(ip_int):
    return socket.inet_ntoa(struct.pack("!I", ip_int))

def log_blocked_ip(ip_str):
    """Append blocked IP with timestamp to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} | {ip_str}\n"
    
    with open(LOG_FILE, "a") as f:
        f.write(log_entry)


# def update_blocklist(ip_int):
#     ip_bytes = struct.pack("!I", ip_int)
#     # Each byte becomes a separate argument
#     ip_hex_args = [f"{b:02x}" for b in ip_bytes]

#     cmd = [
#         "sudo", "bpftool", "map", "update",
#         "name", "blocklist_map",
#         "key", "hex", *ip_hex_args,  # <-- unpack bytes
#         "value", "01"                 # single-byte value
#     ]
    
#     try:
#         subprocess.run(cmd, check=True)
#         print(f"[+] Blocked IP: {socket.inet_ntoa(ip_bytes)}")
#     except subprocess.CalledProcessError as e:
#         print(f"[!] Failed to update block_map for IP {socket.inet_ntoa(ip_bytes)}: {e}")
def update_blocklist(ip_int):
    ip_bytes = struct.pack("!I", ip_int)
    ip_str = socket.inet_ntoa(ip_bytes)
    
    # Each byte becomes a separate argument
    ip_hex_args = [f"{b:02x}" for b in ip_bytes]

    cmd = [
        "sudo", "bpftool", "map", "update",
        "name", "blocklist_map",
        "key", "hex", *ip_hex_args,  # <-- unpack bytes
        "value", "01"                 # single-byte value
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"[+] Blocked IP: {ip_str}")
        log_blocked_ip(ip_str)  # <-- call logging function here
    except subprocess.CalledProcessError as e:
        print(f"[!] Failed to update block_map for IP {ip_str}: {e}")

def get_map_dump(map_name):
    """Fetches real-time packet/byte counts from the XDP kernel map."""
    cmd = ["sudo", "bpftool", "map", "dump", "name", map_name, "-j"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout) if result.stdout else []

# --- THE MONITORING LOOP ---
print(f"\n{'IP Address':<15} | {'PPS':>8} | {'BPS':>10} | {'Verdict'}")
print("-" * 55)

try:
    while True:
        data = get_map_dump(STATS_MAP)
        rows_printed = 0
        
        for entry in data:
            # Parse hex data from bpftool JSON
            key_bytes = bytes(int(x, 16) for x in entry['key'])
            val_bytes = bytes(int(x, 16) for x in entry['value'])
            
            ip_int = struct.unpack("!I", key_bytes)[0]
            # packets and bytes are 64-bit unsigned (Q)
            packets, bytes_total = struct.unpack("<QQ", val_bytes)

            if ip_int in prev_stats:
                old_p, old_b = prev_stats[ip_int]
                pps = (packets - old_p) / INTERVAL
                bps = (bytes_total - old_b) / INTERVAL

                if pps > 0:
                    # Create the data for the model with the NEW standardized names
                    features = pd.DataFrame([[pps, bps]], columns=['PPS', 'BPS'])
                    
                    # Ask the model: Is this an attack?
                    prediction = model.predict(features)[0]
                    ip_str = int_to_ip(ip_int)
                    
                    if prediction == 1:
                        print(f"{ip_str:<15} | {pps:>8.0f} | {bps:>10.0f} | [!!] ATTACK")
                        update_blocklist(ip_int)
                        rows_printed += 1
                    else:
                        print(f"{ip_str:<15} | {pps:>8.0f} | {bps:>10.0f} | NORMAL")
                        rows_printed += 1

            prev_stats[ip_int] = (packets, bytes_total)

        if rows_printed == 0:
            idle_cycles += 1
            if idle_cycles % 10 == 0:
                print("[*] stats_reader alive: waiting for traffic...")
        else:
            idle_cycles = 0
            
        time.sleep(INTERVAL)

except KeyboardInterrupt:
    print("\n[*] Stopping DDoS Monitor...")

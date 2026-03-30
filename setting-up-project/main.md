## Final Execution Steps

### Step 0: Create Runtime Log Folder (once)
```bash
mkdir -p runtime-logs
```

### Step 1: Activate Virtual Environment (in all 3 terminals)
```bash
source venv/bin/activate
````

### Step 2: Load XDP Program (Terminal 2)

```bash
bash scripts/run_xdp_loader_with_logs.sh
```

### Step 3: Start iperf3 Server (Terminal 3)

```bash
bash scripts/run_iperf_server_with_logs.sh
```

### Step 4: Get IP Address (Terminal 1)

```bash
ip addr show wlo1
```

> Use this IP address to send requests from your phone.

### Step 5: Run Stats Reader (Terminal 1)

```bash
bash scripts/run_stats_reader_with_logs.sh
```

**OR**

```bash
sudo stdbuf -oL -eL python userspace/stats_reader.py 2>&1 | tee -a runtime-logs/terminal1_stats_reader.log
```

### Optional: Watch all runtime logs in one terminal

```bash
bash scripts/watch_runtime_logs.sh
```

## Final Execution Steps

### Step 1: Activate Virtual Environment (in all 3 terminals)
```bash
source venv/bin/activate
````

### Step 2: Load XDP Program (Terminal 2)

```bash
sudo ./scripts/load_xdp.sh
```

### Step 3: Start iperf3 Server (Terminal 3)

```bash
iperf3 -s
```

### Step 4: Get IP Address (Terminal 1)

```bash
ip addr show wlo1
```

> Use this IP address to send requests from your phone.

### Step 5: Run Stats Reader (Terminal 1)

```bash
sudo .venv/bin/python userspace/stats_reader.py
```

**OR**

```bash
sudo python userspace/stats_reader.py
```

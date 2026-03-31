
## Setup Instructions

### Terminal 1 — Load XDP Program
```bash
cd ~/Documents/code/final-project-xdp/xdp-ddos
bash scripts/run_xdp_loader_with_logs.sh
````

### Terminal 2 — iPerf Server

```bash
cd ~/Documents/code/final-project-xdp/xdp-ddos
bash scripts/run_iperf_server_with_logs.sh
```

### Terminal 3 — Stats Reader (ML Detection)

```bash
cd ~/Documents/code/final-project-xdp/xdp-ddos
bash scripts/run_stats_reader_with_logs.sh
```

### Terminal 4 — Backend API

```bash
cd ~/Documents/code/final-project-xdp/xdp-ddos/backend
source venv/bin/activate
python main.py
```

### Terminal 5 — Frontend

```bash
cd ~/Documents/code/final-project-xdp/xdp-ddos/frontend
npm run dev
```

### Access the Application

Open the following URL in your browser:

```
http://localhost:3000
```

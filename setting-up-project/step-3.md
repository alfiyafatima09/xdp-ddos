## Python Userspace Environment

The project includes a Python script that reads statistics from the eBPF map (`stats_map`) and computes per-second traffic metrics.

Create a virtual environment inside the project directory:

```bash
python3 -m venv .venv
````

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Install required Python dependencies (if any are listed in requirements.txt):

```bash
pip install -r requirements.txt
```

Make the stats reader executable:

```bash
chmod +x userspace/stats_reader.py
```

Run the userspace statistics reader:

```bash
sudo .venv/bin/python userspace/stats_reader.py
```

The script reads from `stats_map` and calculates:

* Packets Per Second (PPS)
* Bytes Per Second (BPS)
* Source IP

The data is printed once per second.
End it once checked.

---

## Generating Traffic Using iperf3

Traffic is required to observe XDP behavior and statistics.

### Start Server (Ubuntu Machine)

Open a new terminal:

```bash
iperf3 -s
```

This machine now listens for incoming traffic.

---

### Start Client (External Machine)

```powershell
.\iperf3.exe -c <VM-IP> -u -b 50M -t 20
```

Replace `<VM-IP>` with the IP address of the Ubuntu machine:(Looks like inet "1x.1xx.1xx.2xx/2x")

```bash
ip addr show wlo1
```

This generates UDP traffic at 50 Mbps for 20 seconds.


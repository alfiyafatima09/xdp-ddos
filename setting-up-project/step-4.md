# Full Execution Flow (Using External Device / Phone)

This section explains the complete runtime flow using:

* Ubuntu machine → XDP + Server 
* External device (phone / another laptop) → Traffic generator

This setup ensures real ingress traffic hits the physical NIC (`wlo1`).

# System Architecture

```
External Device (Phone / Laptop)
            |
            |  UDP Traffic (iperf3)
            v
        WiFi Router
            |
            v
Ubuntu Machine (wlo1)
    ├── XDP Program (Kernel Space)
    ├── BPF stats_map
    └── Python Stats Reader (User Space)
```

Traffic flows through the router and enters the Ubuntu NIC, allowing XDP to process packets at kernel level.

---

# Prerequisites

* XDP program compiled (`xdp_prog.o` exists)
* Virtual environment created (`.venv`)
* `iperf3` installed
* Network interface identified (`wlo1`)
* Ubuntu connected to WiFi

Check IP address:

```
ip addr show wlo1
```

Note the IPv4 address (example format):

```
xx.xxx.xxx.xxx
```

Do not use loopback (127.0.0.1).

---

# Step 1 – Load XDP Program (Ubuntu)

Open Terminal 1:

```
cd ~/Documents/code/xdp-major-project/xdp-ddos
sudo ./scripts/load_xdp.sh
```

Verify attachment:

```
ip link show wlo1
```

You should see:

```
xdpgeneric/id:XXX
```

XDP is now active at the NIC level.

---

# Step 2 – Start iperf3 Server (Ubuntu)

Open Terminal 2:

```
iperf3 -s
```

Ubuntu is now waiting to receive traffic.

---

# Step 3 – Start Userspace Stats Reader (Ubuntu)

Open Terminal 3:

```
cd ~/Documents/code/xdp-major-project/xdp-ddos
sudo .venv/bin/python userspace/stats_reader.py
```

This script:

* Reads `stats_map` from kernel
* Calculates PPS (Packets Per Second)
* Calculates BPS (Bytes Per Second)
* Prints live traffic metrics

To stop:

```
Ctrl + C
```

---

# Step 4 – Generate Traffic (External Device)

## Option A – From Another Laptop

Install iperf3 and run:

```
iperf3 -c xx.xxx.xxx.xxx -u -b 50M -t 20
```

Replace `xx.xxx.xxx.xxx` with Ubuntu’s IP address.

---

## Option B – From Android Phone

Install Termux.

Inside Termux:

```
pkg install iperf3
iperf3 -c xx.xxx.xxx.xxx -u -b 50M -t 20
```

Traffic now flows:

Phone → Router → Ubuntu → XDP

This produces real external ingress traffic.

---

# What Happens Internally

1. Traffic reaches `wlo1`
2. XDP program processes packets in kernel space
3. Packet and byte counters update in `stats_map`
4. Python script reads the BPF map
5. PPS and BPS are computed per second
6. Features are printed for ML usage



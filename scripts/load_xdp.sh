#!/bin/bash
set -e

IFACE=ens33

sudo ip link set dev $IFACE xdp off 2>/dev/null || true
sudo ip link set dev $IFACE xdp obj xdp_prog.o sec xdp

echo "[+] XDP loaded on $IFACE"

#!/bin/bash
IFACE=wlo1
sudo ip link set dev $IFACE xdp off
echo "[-] XDP unloaded"

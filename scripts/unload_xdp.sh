#!/bin/bash
IFACE=ens33
sudo ip link set dev $IFACE xdp off
echo "[-] XDP unloaded"

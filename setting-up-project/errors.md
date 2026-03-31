
### if : " ip -4 addr show wlo1 " doesnt show the ip address. 


### 1. Unload the XDP Program (The Immediate Fix)
First, we need to remove the XDP program from your wireless interface so the kernel can process network traffic normally again. Run this command:

```bash
sudo ip link set dev wlo1 xdp off
```
You can verify it's removed by running `ip link show wlo1`. The `prog/xdp id 91` line should be gone.

### 2. Restore Your IPv4 Address
Now that the XDP "shield" is down, you can successfully request an IP address. You can let NetworkManager handle it:

```bash
sudo nmcli device connect wlo1
```
*(Or, if you prefer the manual route you were trying, `sudo dhclient -v wlo1` will now work instead of hanging.)*

Verify your IPv4 is back with:

```bash
ip -4 addr show wlo1
```
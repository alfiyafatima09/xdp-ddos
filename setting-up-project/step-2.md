## Building the XDP Program

After completing environment setup and installing `bpftool`, the XDP program was compiled from source.

Clean previous build artifacts:

```bash
make clean
````

Compile the eBPF/XDP program:

```bash
make
```

Successful compilation generates:

```
xdp_prog.o
```

This object file contains the compiled eBPF bytecode that will be loaded into the kernel.

---

## Identifying Network Interface

List available interfaces:

```bash
ip link
```

On this system, the active interface is:

```
wlo1
```

Note: The repository originally referenced `ens33`. The scripts were updated to use `wlo1`.

---

## Updating Load and Unload Scripts

The following changes were made to match the correct interface:

**scripts/load_xdp.sh**

```bash
IFACE=wlo1
```

**scripts/unload_xdp.sh**

```bash
IFACE=wlo1
```

---

## Loading the XDP Program

Attach the XDP program to the network interface:

```bash
sudo ./scripts/load_xdp.sh
```

Successful output:

```
[+] XDP loaded on wlo1
```

---

## Verifying

XDP Attachment:

```bash
ip link show wlo1
```
The output should indicate an attached XDP program.

BPF Maps:

```bash
sudo bpftool map show
```

You should see the `stats_map` entry. This map is used for communication between:

* Kernel space (XDP program)
* User space (Python statistics reader)

At this stage, the XDP program is successfully loaded and operational.

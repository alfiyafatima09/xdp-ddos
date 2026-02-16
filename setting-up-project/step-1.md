# XDP DDoS Mitigation Project

This document describes the complete environment setup performed to prepare the system for developing and running XDP/eBPF programs for DDoS mitigation.The setup was performed on Ubuntu Linux with a custom kernel version that did not have a matching prebuilt `bpftool` package available via apt. As a result, `bpftool` was compiled and installed from source.

---

## System Environment

Operating System: Ubuntu Linux  
Kernel Version: 6.14.0-36-generic  
Compiler: clang 18  
Primary Network Interface: wlo1  
Project Directory: xdp-ddos  

Kernel verification:

```bash
uname -r
````

Compiler verification:

```bash
clang --version
```

Network interface verification:

```bash
ip link
```

---

## Installing Required Dependencies

Update package index:

```bash
sudo apt update
```

Install development tools and libraries required for building bpftool:

```bash
 sudo apt install -y \
  clang llvm libbpf-dev \
  linux-headers-$(uname -r) \
  linux-tools-common \
  linux-tools-$(uname -r) \
  iproute2 \
  python3 python3-venv python3-pip \
  iperf3
```

For the question "Open perf automatically : Select NO"

---

## Issue Encountered During Setup

Attempting to install `bpftool` using apt resulted in:

```
E: Package 'bpftool' has no installation candidate
```

After installing generic linux tools, running:

```bash
bpftool version
```

Produced:

```
WARNING: bpftool not found for kernel 6.14.0-36
You may need to install:
  linux-tools-6.14.0-36-generic
```

The required kernel-specific package was not available for the running kernel version.

## Removing Existing bpftool Binary

The system had a stub or mismatched binary at `/usr/sbin/bpftool`. It was removed before reinstalling:

```bash
sudo rm /usr/sbin/bpftool
```

---

## Cloning bpftool Source

The source was cloned into a system directory:

```bash
git clone --recurse-submodules https://github.com/libbpf/bpftool.git
```

```
cd bpftool/src
```

```
sudo make install
```

```
which bpftool
```

```
sudo ln -s /usr/local/sbin/bpftool /usr/sbin/bpftool
```

---


## Verifying Installation

Confirm successful installation:

```bash
bpftool version
```

The warning regarding kernel mismatch should no longer appear.

---

## Setup Status

The system is now configured with:

* Compatible clang and LLVM toolchain
* Working bpftool built from source
* Required development libraries
* Verified kernel compatibility

The environment is ready for compiling, loading, and attaching XDP/eBPF programs for DDoS mitigation experiments.

---

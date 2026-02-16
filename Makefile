CLANG ?= clang

ARCH := x86
INCLUDES := \
  -I/usr/include \
  -I/usr/include/$(shell uname -m)-linux-gnu

CFLAGS := -O2 -g -Wall -target bpf $(INCLUDES)

all:
	$(CLANG) $(CFLAGS) -c xdp/xdp_prog.c -o xdp_prog.o

clean:
	rm -f xdp_prog.o
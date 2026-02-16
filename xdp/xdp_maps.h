#ifndef __XDP_MAPS_H
#define __XDP_MAPS_H

#include <linux/types.h>

//per-ip traffic statistics
struct ip_stats {
    __u64 packets;
    __u64 bytes;
};

#endif

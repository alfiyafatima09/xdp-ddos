// #ifndef __XDP_MAPS_H
// #define __XDP_MAPS_H

// #include <linux/types.h>

// //per-ip traffic statistics
// struct ip_stats {
//     __u64 packets;
//     __u64 bytes;
// };

// #endif
#ifndef __XDP_MAPS_H
#define __XDP_MAPS_H

#include <linux/types.h>
#include <bpf/bpf_helpers.h>

// ---------------------------------------------
// Per-IP traffic statistics (for ML features)
// ---------------------------------------------
struct ip_stats {
    __u64 packets;
    __u64 bytes;
};

// Map to store per-IP packet + byte counts
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, __u32);             // IP address
    __type(value, struct ip_stats); // stats
} stats_map SEC(".maps");


// ---------------------------------------------
// Blocklist map (for ML → XDP integration)
// ---------------------------------------------
// Stores IPs that should be dropped
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, __u32);  // IP address
    __type(value, __u8); // 1 = blocked
} blocklist_map SEC(".maps");

#endif // __XDP_MAPS_H
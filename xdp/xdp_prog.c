// #include <linux/bpf.h>
// #include <linux/if_ether.h>
// #include <linux/ip.h>
// #include <bpf/bpf_helpers.h>
// #include "xdp_maps.h"


// //BPF MAPS


// //per-source-iP counters
// // struct {
// //     __uint(type, BPF_MAP_TYPE_HASH);
// //     __uint(max_entries, 65536);
// //     __type(key, __u32);              // IPv4 source
// //     __type(value, struct ip_stats);  // counters
// // } stats_map SEC(".maps");

// // //blocklist map (ml model writes here, user space will interact with this) 
// // struct {
// //     __uint(type, BPF_MAP_TYPE_HASH);
// //     __uint(max_entries, 4096);
// //     __type(key, __u32);   // IPv4 source
// //     __type(value, __u8);  // 1 = blocked
// // } blocklist_map SEC(".maps");



// //XDP PROGRAM


// SEC("xdp")
// int xdp_ddos_monitor(struct xdp_md *ctx)
// {
//     void *data_end = (void *)(long)ctx->data_end;
//     void *data     = (void *)(long)ctx->data;

//     //ethernet header 
//     struct ethhdr *eth = data;
//     if ((void *)(eth + 1) > data_end)
//         return XDP_PASS;

//     //only ipv4
//     if (eth->h_proto != __constant_htons(ETH_P_IP))
//         return XDP_PASS;

//     //ip header
//     struct iphdr *ip = (void *)(eth + 1);
//     if ((void *)(ip + 1) > data_end)
//         return XDP_PASS;

//     __u32 src_ip = ip->saddr;

    
//     //  update bpf maps (stats map)

//     struct ip_stats *stats;
//     stats = bpf_map_lookup_elem(&stats_map, &src_ip);

//     if (!stats) {
//         struct ip_stats new_stats = {
//             .packets = 1,
//             .bytes   = data_end - data
//         };
//         bpf_map_update_elem(&stats_map, &src_ip, &new_stats, BPF_ANY);
//     } else {
//         __sync_fetch_and_add(&stats->packets, 1);
//         __sync_fetch_and_add(&stats->bytes, data_end - data);
//     }

    
//     //ml hook (update blocklist map)
    
//     __u8 *blocked = bpf_map_lookup_elem(&blocklist_map, &src_ip);
//     if (blocked)
//         return XDP_DROP;

//     return XDP_PASS;
// }

// char _license[] SEC("license") = "GPL";
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <bpf/bpf_helpers.h>
#include "xdp_maps.h"

SEC("xdp")
int xdp_ddos_monitor(struct xdp_md *ctx)
{
    void *data_end = (void *)(long)ctx->data_end;
    void *data     = (void *)(long)ctx->data;

    // Ethernet header 
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    // Only IPv4
    if (eth->h_proto != __constant_htons(ETH_P_IP))
        return XDP_PASS;

    // IP header
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return XDP_PASS;

    __u32 src_ip = ip->saddr;

    // ---------------------------------
    // 1. Check blocklist FIRST (fast drop)
    // ---------------------------------
    __u8 *blocked = bpf_map_lookup_elem(&blocklist_map, &src_ip);
    if (blocked)
        return XDP_DROP;

    // ---------------------------------
    // 2. Update stats (for ML)
    // ---------------------------------
    struct ip_stats *stats;
    stats = bpf_map_lookup_elem(&stats_map, &src_ip);

    if (!stats) {
        struct ip_stats new_stats = {
            .packets = 1,
            .bytes   = data_end - data
        };
        bpf_map_update_elem(&stats_map, &src_ip, &new_stats, BPF_ANY);
    } else {
        __sync_fetch_and_add(&stats->packets, 1);
        __sync_fetch_and_add(&stats->bytes, data_end - data);
    }

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
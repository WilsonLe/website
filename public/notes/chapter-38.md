---
title: CS372 Chapter 38 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: RAID - Redundant Arrays of Inexpensive Disks
---

# Table of content

- [Table of content](#table-of-content)
- [RAID - Redundant Arrays of Inexpensive Disks](#raid---redundant-arrays-of-inexpensive-disks)
- [Interface And RAID Internals](#interface-and-raid-internals)
- [Fault Model](#fault-model)
- [How To Evaluate A RAID](#how-to-evaluate-a-raid)
- [RAID Level 0: Striping](#raid-level-0-striping)
  - [Chunk Sizes](#chunk-sizes)
  - [Back To RAID-0 Analysis](#back-to-raid-0-analysis)
  - [Evaluating RAID Performance](#evaluating-raid-performance)
  - [Back To RAID-0 Analysis, Again](#back-to-raid-0-analysis-again)
- [RAID Level 1: Mirroring](#raid-level-1-mirroring)
  - [RAID-1 Analysis](#raid-1-analysis)
- [RAID Level 4: Saving Space With Parity](#raid-level-4-saving-space-with-parity)
  - [RAID-4 Analysis](#raid-4-analysis)
- [RAID Level 5: Rotating Parity](#raid-level-5-rotating-parity)
  - [RAID-5 Analysis](#raid-5-analysis)
- [RAID Comparison: A Summary](#raid-comparison-a-summary)
- [Other Interesting RAID Issues](#other-interesting-raid-issues)

# RAID - Redundant Arrays of Inexpensive Disks

Technique to use multiple disks in concert to build a faster, bigger, and more reliable disk system.

Externally, a RAID looks like a disk: a group of blocks one can read or write. Internally, the RAID is a complex beast, consisting of multiple disks, memory (both volatile and non-), and one or more processors to manage the system.

RAIDs offer a number of advantages over a single disk.

1. Performance
2. Capacity
3. Reliability

# Interface And RAID Internals

When a file system issues a logical I/O request to the RAID, the RAID internally must calculate which disk (or disks) to access in order to complete the request, and then issue one or more physical I/Os to do so.

A RAID system is often built as a separate hardware box, with a standard connection (e.g., SCSI, or SATA) to a host.

At a high level, a RAID is very much a specialized computer system: it has a processor, memory, and disks; however, instead of running applications, it runs specialized software designed to operate the RAID.

# Fault Model

In the fail-stop fault model, a disk can be in exactly one of two states: working or failed. With a working disk, all blocks can be read or written. In contrast, when a disk has failed, we assume it is permanently lost.

# How To Evaluate A RAID

The first axis is capacity. Without redundancy, the capacity is N \* B; in contrast, if we have a system that keeps two copies of each block (called mirroring), we obtain a useful capacity of (N \* B)/2.

The second axis of evaluation is reliability. How many disk faults can the given design tolerate? In alignment with our fault model, we assume only that an entire disk can fail.

Finally, the third axis is performance. Performance is somewhat challenging to evaluate, because it depends heavily on the workload presented to the disk array. Thus, before evaluating performance, we will first present a set of typical workloads that one should consider.

# RAID Level 0: Striping

The simplest form of striping will stripe blocks across the disks of the system in a round-robin fashion. This approach is designed to extract the most parallelism from the array when requests are made for contiguous chunks of the array.

![figure 38.1](https://i.ibb.co/L8qF7hV/38-1.png)

## Chunk Sizes

Chunk size mostly affects performance of the array.

Small chunk size implies that many files will get striped across many disks, thus increasing the parallelism of reads and writes to a single file; however, the positioning time to access blocks across multiple disks increases, because the positioning time for the entire request is determined by the maximum of the positioning times of the requests across all drives.

A big chunk size, on the other hand, reduces such intra-file parallelism, and thus relies on multiple concurrent requests to achieve high throughput. However, large chunk sizes reduce positioning time.

## Back To RAID-0 Analysis

From the perspective of capacity, it is perfect: given N disks each of size B blocks, striping delivers N \* B blocks of useful capacity.

From the stand-point of reliability, striping is bad: any disk failure will lead to data loss.

Finally, performance is excellent: all disks are utilized, often in parallel, to service user I/O requests.

## Evaluating RAID Performance

The first is single-request latency. Understanding the latency of a single I/O request to a RAID is useful as it reveals how much parallelism can exist during a single logical I/O operation.

The second is steady-state throughput of the RAID, i.e., the total bandwidth of many concurrent requests.

## Back To RAID-0 Analysis, Again

The latency of a single-block request should be just about identical to that of a single disk; after all, RAID-0 will simply redirect that request to one of its disks.

From the perspective of steady-state sequential throughput, we’d expect to get the full bandwidth of the system. Thus, throughput equals N (the number of disks) multiplied by S (the sequential bandwidth of a single disk).

For a large number of random I/Os, we can again use all of the disks, and thus obtain N \* R MB/s.

# RAID Level 1: Mirroring

With a mirrored system, we simply make more than one copy of each block in the system; each copy should be placed on a separate disk, of course. By doing so, we can tolerate disk failures.

![figure 38.3](https://i.ibb.co/5F57b47/38-3.png)

## RAID-1 Analysis

From a reliability standpoint, RAID-1 does well. It can tolerate the failure of any one disk.

From the perspective of the latency of a single read request, we can see it is the same as the latency on a single disk.

When writing out to disk sequentially, each logical write must result in two physical writes; for example, when we write logical block 0 (in the figure above), the RAID internally would write it to both disk 0 and disk 1. Thus, we can conclude that the maximum bandwidth obtained during sequential writing to a mirrored array is N/2 \* S, or half the peak bandwidth.

We obtain the exact same performance during a sequential read.

Random reads are the best case for a mirrored RAID. In this case, we can distribute the reads across all the disks, and thus obtain the full possible bandwidth.

Finally, random writes perform as you might expect: N/2 \* R. Each logical write must turn into two physical writes, and thus while all the disks will be in use, the client will only perceive this as half the available bandwidth.

# RAID Level 4: Saving Space With Parity

Parity-based approaches attempt to use less capacity and thus overcome the huge space penalty paid by mirrored systems. They do so at a cost, however: performance.

![figure 38.4](https://i.ibb.co/qF2cq70/38-2.png)

![figure 38.4-1](https://i.ibb.co/nMkzvYB/38-4-1.png)

The parity disk uses XOR (additive parity) to determine if there are odd or even number of 1's (or 0's) in all the disk.

If one disk fail, we can determine the lost bits because we keep track of the previous odd/even state of all the disks.

If the parity disk fail, we did not lost any data.

Another form of parity is subtractive parity. First we read the old data, then the old parity, then we compute the old and the new data. If they are the same, then the parity bit should also stay the same. If they are different, we must flip the old parity bit to the opposite of its current state. Either way, we still need to keep the parity disk in sync with the latest data.

## RAID-4 Analysis

From a capacity standpoint, RAID-4 uses 1 disk for parity information for every group of disks it is protecting. Thus, our useful capacity for a RAID group is (N − 1) \* B

Reliability is also quite easy to understand: RAID-4 tolerates 1 disk failure and no more. If more than one disk is lost, there is simply no way to reconstruct the lost data.

Finally, there is performance. This time, let us start by analyzing steady-state throughput.

Sequential read performance can utilize all of the disks except for the parity disk, and thus deliver a peak effective bandwidth of (N − 1) \* S MB/s (an easy case).

The performance of sequential writes on RAID-4 is also (N − 1) \* S MB/s.

We can compute the performance of small random writes in RAID-4 by computing the parity disk’s performance on those two I/Os, and thus we achieve (R/2) MB/s.

A single read (assuming no failure) is just mapped to a single disk, and thus its latency is equivalent to the latency of a single disk request. The latency of a single write requires two reads and then two writes; the reads can happen in parallel, as can the writes, and thus total latency is about twice that of a single disk.

The downside is that on every disk write operation, we have to update the parity disk. Keeping the parity disk synced with the latest data requires some extra overhead. This is called the small-write problem.

# RAID Level 5: Rotating Parity

To address the small-write problem (at least, partially), it rotates the parity block across drives. Now the computing the parity bit is divided accross all disks.

![figure 38.7](https://i.ibb.co/q7Q6Jnx/38-7.png)

## RAID-5 Analysis

The effective capacity and failure tolerance of the two levels (4 and 5) are identical. So are sequential read and write performance. The latency of a single request (whether a read or a write) is also the same as RAID-4.

Random read performance is a little better, because we can now utilize all disks.

Finally, random write performance improves noticeably over RAID-4, as it allows for parallelism across requests.

Because RAID-5 is basically identical to RAID-4 except in the few cases where it is better, it has almost completely replaced RAID-4 in the marketplace.

# RAID Comparison: A Summary

To conclude, if you strictly want performance and do not care about reliability, striping is obviously best.

If you want random I/O performance and reliability, mirroring is the best; the cost you pay is in lost capacity.

If capacity and reliability are your main goals, then RAID-5 is the winner; the cost you pay is in small-write performance.

If you are always doing sequential I/O and want to maximize capacity, RAID-5 also makes the most sense.

# Other Interesting RAID Issues

There are many other RAID designs, including Levels 2 and 3 from the original taxonomy, and Level 6 to tolerate multiple disk faults. There is also what the RAID does when a disk fails; sometimes it has a hot spare sitting around to fill in for the failed disk.

Finally, you can even build RAID as a software layer: such software RAID systems are cheaper but have other problems, including the consistent-update problem.

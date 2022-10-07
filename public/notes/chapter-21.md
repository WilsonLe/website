---
title: CS372 Chapter 20 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Beyond Physical Memory (Mechanisms)
---

# Table of content

- [Table of content](#table-of-content)
- [Beyond Physical Memory (Mechanisms)](#beyond-physical-memory-mechanisms)
- [Swap Space](#swap-space)
- [The Present Bit](#the-present-bit)
- [The Page Fault](#the-page-fault)
- [What If Memory Is Full?](#what-if-memory-is-full)
- [Page Fault Control Flow](#page-fault-control-flow)
- [When Replacements Really Occur](#when-replacements-really-occur)

# Beyond Physical Memory (Mechanisms)

We will now relax these big assumptions, and assume that we wish to support many concurrently-running large address spaces. To do so, we require an additional level in the memory hierarchy.

The problem: How can the OS make use of a larger, slower device to transparently provide the illusion of a large virtual address space?

# Swap Space

The first thing we will need to do is to reserve some **swap space** on the disk for moving pages back and forth.

![figure 21.1](https://i.ibb.co/jkMyjL0/21-1.png)

In the figure, three processes (Proc 0, Proc 1, and Proc 2) are actively sharing physical memory; each of the three, however, only have some of their valid pages in memory, with the rest located in swap space on disk. A fourth process (Proc 3) has all of its pages swapped out to disk, and thus clearly isn’t currently running. One block of swap remains free.

We should note that swap space is not the only on-disk location for swapping traffic.

# The Present Bit

Let us assume, for simplicity, that we have a system with a hardware-managed TLB, now we need to add some machinery higher up in the system in order to support swapping pages to and from the disk.

Recall first what happens on a memory reference:

1. The running process generates virtual memory references
2. The hardware translates them into physical addresses
   2.1. Extracts the VPN from the virtual address
   2.2. Checks the TLB for a match
   2.2.1. If a hit, produces the resulting physical address
   2.2.2. If a miss, the hardware locates the page table in memory (using the page table base register)
   2.2.3. Looks up the page table entry (PTE) for this page using the VPN as an index
   2.2.4. If the page is valid and present in physical memory, the hardware extracts the PFN from the PTE, installs it in the TLB, and retries the instruction, this time generating a TLB hit
3. Fetches from memory

If we wish to allow pages to be swapped to disk, however, we must add even more machinery. Specifically, when the hardware looks in the PTE, it may find that the page is not present in physical memory. The way the hardware determines this is through a new piece of information in each page-table entry, known as the present bit.

If the present bit is set to one, it means the page is present in physical memory and everything proceeds as above; if it is set to zero, the page is not in memory but rather on disk somewhere.

# The Page Fault

The act of accessing a page that is not in physical memory is commonly referred to as a **page fault**. Upon a page fault, the OS is invoked to service the page fault. A particular piece of code, known as a page-fault handler, runs.

Recall that with TLB misses, we have two types of systems: hardware-managed TLBs and software-managed TLBs. In either type of system, if a page is not present, the OS is put in charge to handle the page fault.

When the OS receives a page fault for a page, it looks in the PTE to find the address, and issues the request to disk to fetch the page into memory.

When the disk I/O completes, the OS will then update the page table to mark the page as present, update the PFN field of the page-table entry (PTE) to record the in-memory location of the newly-fetched page, and retry the instruction.

This next attempt may generate a TLB miss, which would then be serviced and update the TLB with the translation.

Finally, a last restart would find the translation in the TLB and thus proceed to fetch the desired data or instruction from memory at the translated physical address.

Note that while the I/O is in flight, the process will be in the blocked state. Thus, the OS will be free to run other ready processes while the page fault is being serviced.

Because I/O is expensive, this overlap of the I/O (page fault) of one process and the execution of another is yet another way a multiprogrammed system can make the most effective use of its hardware.

# What If Memory Is Full?

The OS might like to first remove one or more pages to make room for the new page(s) the OS is about to bring in. The process of picking a page to kick out, or replace is known as the **page-replacement policy**.

As it turns out, a lot of thought has been put into creating a good page-replacement policy, as kicking out the wrong page can exact a great cost on program performance.

Making the wrong decision can cause a program to run at disk-like speeds instead of memory-like speeds; in current technology that means a program could run 10,000 or 100,000 times slower.

# Page Fault Control Flow

![figure 21.2](https://i.ibb.co/BZ7DvsG/21-2.png)

Refer to the figure above, we notice that there are three important cases to understand when a TLB miss occurs:

1. The page was both present and valid (Lines 18–21): the TLB miss handler can simply grab the PFN from the PTE, retry the instruction (this time resulting in a TLB hit), and thus continue as described
2. The page is valid but not present (Lines 22-23): the page fault handler must be run.
3. The access could be to an invalid page, due for example to a bug in the program (Lines 13–14). In this case, no other bits in the PTE really matter; the hardware traps this invalid access, and the OS trap handler runs, likely terminating the offending process.

![figure 21.3](https://i.ibb.co/JQTN54H/21-3.png)

Referring to the figure above, in a page fault incident, the OS does the following:

1. Find a physical frame for the soon-to-be-faulted-in page to reside within; if there is no such page, we’ll have to wait for the replacement algorithm to run and kick some pages out of memory, thus freeing them for use here.
2. With a physical frame in hand, the handler then issues the I/O request to read in the page from swap space.
3. When that slow operation completes, the OS updates the page table and retries the instruction. The retry will result in a TLB miss, and then, upon another retry, a TLB hit, at which point the hardware will be able to access the desired item.

# When Replacements Really Occur

To keep a small amount of memory free, most operating systems thus have some kind of **high watermark (HW)** and **low watermark (LW)** to help decide when to start evicting pages from memory.

When the OS notices that there are fewer than **LW** pages available, a background thread that is responsible for freeing memory runs. The thread evicts pages until there are **HW** pages available. The background thread, sometimes called the **swap daemon** or **page daemon**, then goes to sleep, happy that it has freed some memory for running processes and the OS to use.

By performing a number of replacements at once, new performance optimizations become possible. For example, many systems will cluster or group a number of pages and write them out at once to the swap partition, thus increasing the efficiency of the disk. Such clustering reduces seek and rotational overheads of a disk and thus increases performance noticeably.

To work with the background paging thread, the control flow in the closest figure above should be modified slightly. Instead of performing a replacement directly, the algorithm would instead simply check if there are any free pages available. If not, it would inform the background paging thread that free pages are needed; when the thread frees up some pages, it would re-awaken the original thread, which could then page in the desired page and go about its work.

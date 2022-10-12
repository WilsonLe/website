---
title: CS372 Chapter 23 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Complete Virtual Memory Systems
---

# Table of content

- [Table of content](#table-of-content)
- [VAX/VMS Virtual Memory](#vaxvms-virtual-memory)
  - [Memory Management Hardware](#memory-management-hardware)
  - [A Real Address Space](#a-real-address-space)
  - [Page Replacement](#page-replacement)
- [The Linux Virtual Memory System](#the-linux-virtual-memory-system)
  - [The Linux Address Space](#the-linux-address-space)
  - [Page Table Structure](#page-table-structure)
  - [Large Page Support](#large-page-support)
  - [The Page Cache](#the-page-cache)
  - [Security And Buffer Overflows](#security-and-buffer-overflows)
  - [Other Security Problems: Meltdown And Spectre](#other-security-problems-meltdown-and-spectre)

# VAX/VMS Virtual Memory

## Memory Management Hardware

The VAX-11 provided a 32-bit virtual address space per process, divided into 512-byte pages. Thus, a virtual address consisted of a 23-bit VPN and a 9-bit offset. Further, the upper two bits of the VPN were used to differentiate which segment the page resided within; thus, the system was a hybrid of paging and segmentation.

The upper-half of the address space is known as system space (S), although only half of it is used. Protected OS code and data reside here, and the OS is in this way shared across processes.

The lower-half of the address space was known as “process space” and is unique to each process.

In the first half of process space (known as P0), the user program is found, as well as a heap which grows downward.

In the second half of process space (P1), we find the stack, which grows upwards.

The system reduced the pressure page tables place on memory in two ways: 

1. By segmenting the user address space into two, the VAX-11 provides a page table for each of these regions (P0 and P1) per process; thus, no page-table space is needed for the unused portion of the address space between the stack and the heap. The base register holds the address of the page table for that segment, and the bounds holds its size (i.e., number of page-table entries).
2. By placing user page tables (for P0 and P1, thus two per process) in kernel virtual memory. When allocating or growing a page table, the kernel allocates space out of its own virtual memory, in segment S. If memory comes under severe pressure, the kernel can swap pages of these page tables out to disk, thus making physical memory available for other uses.

Putting page tables in kernel virtual memory means that address translation is even further complicated.

For example, to translate a virtual address in P0 or P1, the hardware has to consult the system page table (which lives in physical memory) to look up the page-table entry for that page in its page table. With that translation complete, the hardware can learn the address of the page of the page table, and then finally learn the address of the desired memory access.

## A Real Address Space

![figure 23.1](https://i.ibb.co/kBpfDdQ/23-1.png)

Page 0 is marked inaccessible in order to provide some support for detecting null-pointer accesses. Thus, one concern when designing an address space is support for debugging, which the inaccessible zero page provides here in some form.

Perhaps more importantly, the kernel virtual address space (i.e., its data structures and code) is a part of each user address space. 

On a context switch, the OS changes the P0 and P1 registers to point to the appropriate page tables of the soon-to-be-run process; however, it does not change the S base and bound registers, and as a result the “same” kernel structures are mapped into each user address space.

The kernel is mapped into each address space for a number of reasons. This construction makes life easier for the kernel; when, for example, the OS is handed a pointer from a user program (e.g., on a write() system call), it is easy to copy data from that pointer to its own structures.

One last point about this address space relates to protection. Clearly, the OS does not want user applications reading or writing OS data or code. Thus, the hardware must support different protection levels for pages to enable this. 

The VAX did so by specifying, in protection bits in the page table, what privilege level the CPU must be at in order to access a particular page.

Thus, system data and code are set to a higher level of protection than user data and code; an attempted access to such information from user code will generate a trap into the OS, and (you guessed it) the likely termination of the offending process.

## Page Replacement

The page table entry (PTE) in VAX contains the following bits: a valid bit, a protection field (4 bits), a modify (or dirty) bit, a field reserved for OS use (5 bits), and finally a physical frame number (PFN) to store the location of the page in physical memory. Notice that there is no reference bit. Thus, the VMS replacement algorithm must make do without hardware support for determining which pages are active.

VAX uses the segmented FIFO replacement policy. The idea is simple: each process has a maximum number of pages it can keep in memory, known as its resident set size (RSS). Each of these pages is kept on a FIFO list; when a process exceeds its RSS, the “first-in” page is evicted. FIFO clearly does not need any support from the hardware, and is thus easy to implement.

To improve FIFO’s performance, VMS introduced two second-chance lists where pages are placed before getting evicted from memory, specifically a global clean-page free list and dirty-page list.

When a process P exceeds its RSS, a page is removed from its per-process FIFO; if clean (not modified), it is placed on the end of the clean-page list; if dirty (modified), it is placed on the end of the dirty-page list. 

If another process Q needs a free page, it takes the first free page off of the global clean list. However, if the original process P faults on that page before it is reclaimed, P reclaims it from the free (or dirty) list, thus avoiding a costly disk access.

The bigger these global second-chance lists are, the closer the segmented FIFO algorithm performs to LRU.

Disk I/O during swapping could be highly inefficient, as disks do better with large transfers. To make swapping I/O more efficient, VMS adds a number of optimizations, but most important is clustering. With clustering, VMS groups large batches of pages together from the global dirty list, and writes them to disk in one fell swoop (thus making them clean).

# The Linux Virtual Memory System

## The Linux Address Space

Much like other modern operating systems, and also like VAX/VMS, a Linux virtual address space1 consists of a user portion (where user program code, stack, heap, and other parts reside) and a kernel portion (where kernel code, stacks, heap, and other parts reside).

![figure 23.2](https://i.ibb.co/sypmkpP/23-2.png)

Like those other systems, upon a context switch, the user portion of the currently-running address space changes; the kernel portion is the same across processes.

Like those other systems, a program running in user mode cannot access kernel virtual pages; only by trapping into the kernel and transitioning to privileged mode can such memory be accessed.

One slightly interesting aspect of Linux is that it contains two types of kernel virtual addresses.

The first are known as kernel logical addresses. This is what you would consider the normal virtual address space of the kernel; to get more memory of this type, kernel code merely needs to call kmalloc. Most kernel data structures live here, such as page tables, per-process kernel stacks, and so forth. Unlike most other memory in the system, kernel logical memory cannot be swapped to disk.

There is a direct mapping between kernel logical addresses and the first portion of physical memory. Thus, kernel logical address 0xC0000000 translates to physical address 0x00000000, 0xC0000FFF to 0x00000FFF, and so forth. This direct mapping has two implications:

1. It is simple to translate back and forth between kernel logical addresses and physical addresses; as a result, these addresses are often treated as if they are indeed physical.
2. The second is that if a chunk of memory is contiguous in kernel logical address space, it is also contiguous in physical memory. This makes memory allocated in this part of the kernel’s address space suitable for operations which need contiguous physical memory to work correctly, such as I/O transfers to and from devices via directory memory access (DMA).

The other type of kernel address is a kernel virtual address. To get memory of this type, kernel code calls a different allocator, vmalloc, which returns a pointer to a virtually contiguous region of the desired size.

Unlike kernel logical memory, kernel virtual memory is usually not contiguous; each kernel virtual page may map to non-contiguous physical pages (and is thus not suitable for DMA). However, such memory is easier to allocate as a result, and thus used for large buffers where finding a contiguous large chunk of physical memory would be challenging.

## Page Table Structure

Because we are focused on Linux for x86, our discussion will center on the type of page-table structure provided by x86, as it determines what Linux can and cannot do.

x86 provides a hardware-managed, multi-level page table structure, with one page table per process; the OS simply sets up mappings in its memory, points a privileged register at the start of the page directory, and the hardware handles the rest.

The OS gets involved, as expected, at process creation, deletion, and upon context switches, making sure in each case that the correct page table is being used by the hardware MMU to perform translations.

![linux-x86-64bit-virtual-address](https://i.ibb.co/wND3cTk/a.png)

- The top 16 bits of a virtual address are unused (and thus play no role in translation)
- The bottom 12 bits (due to the 4-KB page size) are used as the offset (and hence just used directly, and not translated), leaving the middle 36 bits of virtual address to take part in the translation.
- The P1 portion of the address is used to index into the topmost page directory, and the translation proceeds from there, one level at a time, until the actual page of the page table is indexed by P4, yielding the desired page table entry.

## Large Page Support
Using huge pages leads to numerous benefits. 

As seen in VAX/VMS, doing so reduces the number of mappings that are needed in the page table; the larger the pages, the fewer the mappings. However, fewer page-table entries is not the driving force behind huge pages; rather, it’s better TLB behavior and related performance gains.

When a process actively uses a large amount of memory, it quickly fills up the TLB with translations. If those translations are for 4-KB pages, only a small amount of total memory can be accessed without inducing TLB misses.

The result, for modern “big memory” workloads running on machines with many GBs of memory, is a noticeable performance cost; recent research shows that some applications spend 10% of their cycles servicing TLB misses. Huge pages allow a process to access a large tract of memory without TLB misses, by using fewer slots in the TLB, and thus is the main advantage.

Huge pages are not without their costs. 

1. The biggest potential cost is internal fragmentation, i.e., a page that is large but sparsely used.
2. Swapping, if enabled, also does not work well with huge pages, sometimes greatly amplifying the amount of I/O a system does.
3. Overhead of allocation can also be bad (in some other cases)

## The Page Cache

To reduce costs of accessing persistent storage most systems use aggressive caching subsystems to keep popular data items in memory. Linux, in this regard, is no different than traditional operating systems.

The Linux page cache is unified, keeping pages in memory from three primary sources: 

1. memory-mapped files
2. file data and metadata from devices (usually accessed by directing read() and write() calls to the file system)
3. heap and stack pages that comprise each process (sometimes called anonymous memory, because there is no named file underneath of it, but rather swap space).


In some cases, a system runs low on memory, and Linux has to decide which pages to kick out of memory to free up space. To do so, Linux uses a modified form of 2Q replacement.

The basic idea is simple: standard LRU replacement is effective, but can be subverted by certain common access patterns.

For example, if a process repeatedly accesses a large file (especially one that is nearly the size of memory, or larger), LRU will kick every other file out of memory. Even worse: retaining portions of this file in memory isn’t useful, as they are never re-referenced before getting kicked out of memory.

The Linux version of the 2Q replacement algorithm solves this problem by keeping two lists, and dividing memory between them. When accessed for the first time, a page is placed on one queue (called A1 in the original paper, but the inactive list in Linux); when it is re-referenced, the page is promoted to the other queue (called Aq in the original, but the active list in Linux).

When replacement needs to take place, the candidate for replacement is taken from the inactive list.

Linux would ideally manage these lists in perfect LRU order, but, as discussed in earlier chapters, doing so is costly. Thus, as with many OSes, an approximation of LRU (similar to clock replacement) is used.

## Security And Buffer Overflows

One major threat is found in buffer overflow attacks, which can be used against normal user programs and even the kernel itself.

The idea of these attacks is to find a bug in the target system which lets the attacker inject arbitrary data into the target’s address space.

Such vulnerabilities sometime arise because the developer assumes (erroneously) that an input will not be overly long, and thus (trustingly) copies the input into a buffer; because the input is in fact too long, it overflows the buffer, thus overwriting memory of the target.

The first and most simple defense against buffer overflow is to prevent execution of any code found within certain regions of an address space (e.g., within the stack). The NX bit (for No-eXecute), introduced by AMD into their version of x86 (a similar XD bit is now available on Intel’s), is one such defense.

The observation behind ROP is that there are lots of bits of code (gadgets, in ROP terminology) within any program’s address space, especially C programs that link with the voluminous C library. Thus, an attacker can overwrite the stack such that the return address in the currently executing function points to a desired malicious instruction (or series of instructions), followed by a return instruction. By stringing together a large number of gadgets (i.e., ensuring each return jumps to the next gadget), the attacker can execute arbitrary code.

To defend against ROP, Linux (and other systems) add another defense, known as address space layout randomization (ASLR): instead of placing code, stack, and the heap at fixed locations within the virtual address space, the OS randomizes their placement, thus making it quite challenging to craft the intricate code sequence required to implement this class of attacks. 

Most attacks on vulnerable user programs will thus cause crashes, but not be able to gain control of the running program.

ASLR is such a useful defense for user-level programs that it has also been incorporated into the kernel, in a feature unimaginatively called kernel address space layout randomization (KASLR). 

## Other Security Problems: Meltdown And Spectre

The general weakness exploited in each of these attacks is that the CPUs found in modern systems perform all sorts of crazy behind-the-scenes tricks to improve performance.

One class of technique that lies at the core of the problem is called speculative execution, in which the CPU guesses which instructions will soon be executed in the future, and starts executing them ahead of time.

If the guesses are correct, the program runs faster; if not, the CPU undoes their effects on architectural state (e.g., registers) tries again, this time going down the right path.

The problem with speculation is that it tends to leave traces of its execution in various parts of the system, such as processor caches, branch predictors, etc. And thus the problem: as the authors of the attacks show, such state can make vulnerable the contents of memory, even memory that we thought was protected by the MMU.

One avenue to increasing kernel protection was thus to remove as much of the kernel address space from each user process and instead have a separate kernel page table for most kernel data (called kernel pagetable isolation, or KPTI)

Thus, instead of mapping the kernel’s code and data structures into each process, only the barest minimum is kept therein; when switching into the kernel, then, a switch to the kernel page table is now needed.

Doing so improves security and avoids some attack vectors, but at a cost: performance. Switching page tables is costly.

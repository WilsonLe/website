---
title: CS372 Chapter 17 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Paging
---

# Table of content

- [Table of content](#table-of-content)
- [Simple Example And Overview](#simple-example-and-overview)
- [Address Translation Example](#address-translation-example)
- [Where Are Page Tables Stored?](#where-are-page-tables-stored)
- [What’s Actually In The Page Table?](#whats-actually-in-the-page-table)
	- [Valid Bit](#valid-bit)
	- [Protection Bits](#protection-bits)
	- [Others](#others)
- [Paging: Also Too Slow](#paging-also-too-slow)
- [Summary](#summary)

# Simple Example And Overview

![figure 18.1](https://i.ibb.co/kHSLrhC/18-1.png)
The figure above presents an example of a tiny address space, only 64 bytes total in size, with four 16-byte pages (virtual pages 0, 1, 2, and 3).

Paging, as we will see, has a number of advantages over our previous approaches:

1. Flexibility: with a fully-developed paging approach, the system will be able to support the abstraction of an address space effectively, regardless of how a process uses the address space; we won’t, for example, make assump- tions about the direction the heap and stack grow and how they are used.

2. Simplicity of free-space management that paging affords. For example, when the OS wishes to place our tiny 64-byte address space into our physical memory, it simply finds four free pages (assuming each page has 16 bytes); perhaps the OS keeps a free list of all free pages for this, and just grabs the first four free pages off of this list.

To record where each virtual page of the address space is placed in physical memory, the operating system usually keeps a per-process data structure known as a page table. The major role of the page table is to store address translations for each of the virtual pages of the address space, thus letting us know where in physical memory each page resides.

![figure 18.2](https://i.ibb.co/zmxbWyZ/18-2.png)

For example, asusming we have the physical memory as the above figure, the page table would have the following entries:

1. Virtual Page 0 → Physical Frame 3
2. Virtual Page 1 → Physical Frame 7
3. Virtual Page 2 → Physical Frame 5
4. Virtual Page 3 → Physical Frame 2

It is important to remember that this page table is a per-process data structure. If another process were to run in our example above, the OS would have to manage a different page table for it, as its virtual pages obviously map to different physical pages (modulo any sharing going on).

# Address Translation Example

Let’s imagine the process with that tiny address space (64 bytes) is per- forming a memory access:

```
movl <virtual address>, %eax
```

To translate this virtual address that the process generated, we have to first split it into two components: the virtual page number (VPN), and the offset within the page.

For this example, because the virtual address space of the process is 64 bytes, we need 6 bits total for our virtual address (26 = 64). Thus, our virtual address can be conceptualized as follows:

![vpn-offset](https://i.ibb.co/JzSQRNn/vpn-offset.png)

In this diagram, Va5 is the highest-order bit of the virtual address, and Va0 the lowest-order bit. Because we know the page size (16 bytes), we can further divide the virtual address into VPN and offset like above.

The page size is 16 bytes in a 64-byte address space; thus we need to be able to select 4 pages, and the top 2 bits of the address do just that. Thus, we have a 2-bit virtual page number (VPN).

The remaining bits tell us which byte of the page we are interested in, 4 bits in this case; we call this the offset.

When a process generates a virtual address, the OS and hardware must combine to translate it into a meaningful physical address.

For example, let us assume the load above was to virtual address 21. Turning “21” into binary form, we get “010101”, and thus we break the binary down as follows:

![vpn-offset-21](https://i.ibb.co/kX0sVnc/vpn-offset-21.png)

Thus, the virtual address “21” is on the 5th (“0101”th) byte of virtual page “01” (or 1). With our virtual page number, we can now index our page table and find which physical frame virtual page 1 resides within.

In the page table above the physical frame number (PFN) is 7 (binary 111). Thus, we can translate this virtual address by replacing the VPN with the PFN and then issue the load to physical memory.

![figure 18.3](https://i.ibb.co/1qVNcm5/18-3.png)

# Where Are Page Tables Stored?

Page tables can get terribly large, much bigger than the small segment table or base/bounds pair we have discussed previously. A typical 32-bit address space, with 4KB pages. This virtual address splits into a 20-bit VPN and 12-bit offset

A 20-bit VPN implies that there are 220 translations that the OS would have to manage for each process (that’s roughly a million). Assuming we need 4 bytes per page table entry (PTE) to hold the physical translation plus any other useful stuff, we get an immense 4MB of memory needed for each page table

Because page tables are so big, we don’t keep any special on-chip hard- ware in the MMU to store the page table of the currently-running process.

Instead, we store the page table for each process in memory somewhere. Let’s assume for now that the page tables live in physical memory that the OS manages; later we’ll see that much of OS memory itself can be vir- tualized, and thus page tables can be stored in OS virtual memory (and even swapped to disk).

# What’s Actually In The Page Table?

Let’s talk a little about page table organization. The page table is just a data structure that is used to map virtual addresses (or really, virtual page numbers) to physical addresses (physical frame numbers). For now, we will assume simple linear structure: **linear page table**, which is basically an array. In later chapters, we will make use of more advanced data structures to help solve some problems with paging.

As for the content of PTE:

## Valid Bit

A valid bit is common to indicate whether the particular translation is valid. For example, when a program starts running, it will have code and heap at one end of its address space, and the stack at the other. All the unused space in-between will be marked invalid, and if the process tries to access such memory, it will generate a trap to the OS which will likely terminate the process.

Thus, the valid bit is crucial for supporting a sparse address space; by simply marking all the unused pages in the address space invalid, we remove the need to allocate physical frames for those pages and thus save a great deal of memory.

## Protection Bits

Indicating whether the page could be read from, written to, or executed from. Again, accessing a page in a way not allowed by these bits will generate a trap to the OS.

## Others

There are a couple of other bits that are important but we won’t talk about much for now. A **present bit** indicates whether this page is in physical memory or on disk (i.e., it has been swapped out).

A **dirty bit** is also common, indicating whether the page has been modified since it was brought into memory.

A **reference bit** is sometimes used to track whether a page has been accessed, and is useful in determining which pages are popular and thus should be kept in memory; such knowledge is critical during page replacement, a topic we will study in great detail in subsequent chapters.

# Paging: Also Too Slow

With page tables in memory, we already know that they might be too big. As it turns out, they can slow things down too. For example, take our simple instruction:

```
movl 21, %eax
```

To fetch the desired data, the system must first translate the virtual address (21) into the correct physical address (117). Thus, before fetching the data from address 117, the system must first fetch the proper page table entry from the process’s page table, perform the translation, and then load the data from physical memory.

To do so, the hardware must know where the page table is for the currently-running process. Let’s assume for now that a single page-table base register contains the physical address of the starting location of the page table. To find the location of the desired PTE, the hardware will thus perform the following functions:

```
VPN = (VirtualAddress & VPN_MASK) >> SHIFT
PTEAddr = PageTableBaseRegister + (VPN * sizeof(PTE))
```

For example, with virtual address 21 (010101), and masking (110000) turns this value into 010000; the shift (4) turns it into 01, or virtual page 1, as desired.

Once this physical address is known, the hardware can fetch the PTE from memory, extract the PFN, and concatenate it with the offset from the virtual address to form the desired physical address as follows:

```
offset = VirtualAddress & OFFSET_MASK
PhysAddr = (PFN << SHIFT) | offset
```

Finally, the hardware can fetch the desired data from memory and put it into register eax. The program has now succeeded at loading a value from memory.

Without careful design of both hardware and software, page tables will cause the system to run too slowly (memory references are costly), as well as take up too much memory.

# Summary

We have introduced the concept of paging as a solution to our challenge of virtualizing memory. Paging has many advantages over previous approaches (such as segmentation).

First, it does not lead to external fragmentation, as paging (by design) divides memory into fixed-sized units.

Second, it is quite flexible, enabling the sparse use of virtual address spaces.

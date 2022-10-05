---
title: CS372 Chapter 20 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Paging - Smaller Tables
---

# Table of content

- [Table of content](#table-of-content)
- [The Problem](#the-problem)
- [Simple Solution: Bigger Pages](#simple-solution-bigger-pages)
- [Hybrid Approach: Paging and Segments](#hybrid-approach-paging-and-segments)
- [Multi-level Page Tables](#multi-level-page-tables)
- [Inverted Page Tables](#inverted-page-tables)
- [Swapping the Page Tables to Disk](#swapping-the-page-tables-to-disk)

# The Problem

linear page tables get pretty big. Assume again a 32-bit address space (2^32 bytes), with 4KB (2^12 byte) pages and a 4-byte page-table entry.

An address space thus has roughly one million virtual pages in it (2^32 / 2^12); multiply by the page-table entry size and you see that our page table is 4MB in size.

We usually have one page table for every process in the system. With a hundred active processes (not uncommon on a modern system), we will be allocating hundreds of megabytes of memory just for page tables!

# Simple Solution: Bigger Pages

One simple way to reduce memory: use bigger pages. Take our 32-bit address space again, but this time assume 16KB pages.

We would thus have an 18-bit VPN plus a 14-bit offset. As- suming the same size for each PTE (4 bytes), we now have 2^18 entries in our linear page table and thus a total size of 1MB per page table, a factor of 4 reduction.

The major problem with this approach, however, is that big pages lead to waste within each page, a problem known as internal fragmentation (as the waste is internal to the unit of allocation).

Applications thus end up allocating pages but only using little bits and pieces of each, and memory quickly fills up with these overly-large pages.

# Hybrid Approach: Paging and Segments

Whenever you have two reasonable but different approaches to something in life, you should always examine the combination of the two to see if you can obtain the best of both worlds.

Thus, our hybrid approach: instead of having a single page table for the entire address space of the process, why not have one per logical segment? In this example, we might thus have three page tables, one for the code, heap, and stack parts of the address space.

![figure 20.1](https://i.ibb.co/y5yXsR0/20-1.png)

![figure 20.2](https://i.ibb.co/pLfYSt5/20-2.png)

With segmentation alone, we had a base register that told us where each segment lived in physical memory, and a bound or limit register that told us the size of said segment. In our hybrid, we still have those structures in the MMU; here, we use the base not to point to the segment itself but rather to hold the physical address of the page table of that segment. The bounds register is used to indicate the end of the page table (i.e., how many valid pages it has).

This hybrid approach still has some drawbacks:

- It still requires us to use segmentation, which is not quite as flexible as we would like, as it assumes a certain usage pattern of the address space
- external fragmentation can occur: While most of memory is managed in page-sized units, page tables now can be of arbitrary size (in multiples of PTEs). Thus, finding free space for them in memory is more complicated

# Multi-level Page Tables

It turns the linear page table into something like a tree. This approach is so effective that many modern systems employ it (e.g., x86)

Basic ideas:

- Chop up the page table into page-sized units
- If an entire page of page-table entries (PTEs) is invalid, don’t allocate that page of the page table at all
- To track whether a page of the page table is valid (and if valid, where it is in memory), use a new structure, called the page directory
- The page directory thus either can be used to tell you where a page of the page table is, or that the entire page of the page table contains no valid pages.

![figure 20.3](https://i.ibb.co/h1yvkJV/20-3.png)

Consider the above figure.

On the left of the figure is the classic linear page table; even though most of the middle regions of the address space are not valid, we still require page-table space allocated for those regions.

On the right is a multi-level page table. The page directory marks just two pages of the page table as valid (the first and last); thus, just those two pages of the page table reside in memory. And thus you can see one way to visualize what a multi-level table is doing: it just makes parts of the linear page table disappear (freeing those frames for other uses), and tracks which pages of the page table are allocated with the page directory.

The page directory, in a simple two-level table, contains one entry per page of the page table. A PDE (minimally) has a valid bit and a page frame number (PFN), similar to a PTE. If the PDE is valid, it means that at least one of the pages of the page table that the entry points to (via the PFN) is valid, i.e., in at least one PTE on that page pointed to by this PDE, the valid bit in that PTE is set to one. If the PDE is not valid (i.e., equal to zero), the rest of the PDE is not defined.

Properties:

- multi-level table only allocates page-table space in proportion to the amount of address space you are using; thus it is generally compact and supports sparse address spaces.
- if carefully constructed, each portion of the page table fits neatly within a page, making it easier to manage memory; the OS can simply grab the next free page when it needs to allocate or grow a page table.
- With a multi-level structure, we add a level of indirection through use of the page directory, which points to pieces of the page table; that indirection allows us to place page-table pages wherever we would like in physical memory. (no need for a continuos memory)
- On a TLB miss, two loads from memory will be required to get the right translation information from the page table (one for the page directory, and one for the PTE itself), in contrast to just one load with a linear page table. Thus, the multi-level table is a small example of a **time-space trade-off**.
- Whether it is the hardware or OS handling the page-table lookup (on a TLB miss), doing so is undoubt- edly more involved than a simple linear page-table lookup.

# Inverted Page Tables

Instead of having many page tables (one per process of the system), we keep a single page table that has an entry for each physical page of the system. The entry tells us which process is using this page, and which virtual page of that process maps to this physical page.

Finding the correct entry is now a matter of searching through this data structure. A linear scan would be expensive, and thus a hash table is often built over the base structure to speed up lookups

# Swapping the Page Tables to Disk

Even with our many tricks to reduce the size of page tables, it is still possible, however, that they may be too big to fit into memory all at once. Thus, some systems place such page tables in kernel virtual memory, thereby allowing the system to swap some of these page tables to disk when memory pressure gets a little tight.

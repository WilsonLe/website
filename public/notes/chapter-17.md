---
title: CS372 Chapter 17 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Free space management
---

# Table of content

- [Table of content](#table-of-content)
- [Free space management](#free-space-management)
- [Assumptions](#assumptions)
- [Low-level Mechanisms](#low-level-mechanisms)
	- [Splitting and Coalescing](#splitting-and-coalescing)
	- [Tracking The Size Of Allocated Regions](#tracking-the-size-of-allocated-regions)
	- [Embedding A Free List](#embedding-a-free-list)
	- [Growing The Heap](#growing-the-heap)
- [Basic Strategies](#basic-strategies)
	- [Best Fit](#best-fit)
	- [Worst Fit](#worst-fit)
	- [First Fit](#first-fit)
	- [Next Fit](#next-fit)
- [Other Approaches](#other-approaches)
	- [Segregated Lists](#segregated-lists)
	- [Buddy Allocation](#buddy-allocation)

# Free space management

Managing free space can certainly be easy, as we will see when we discuss the concept of paging. It is easy when the space you are managing is divided into fixed-sized units; in such a case, you just keep a list of these fixed-sized units; when a client requests one of them, return the first entry.

Where free-space management becomes more difficult (and interest- ing) is when the free space you are managing consists of variable-sized units; this arises in a user-level memory-allocation library (as in malloc() and free()) and in an OS managing physical memory when using seg- mentation to implement virtual memory.

In either case, the problem that exists is known as external fragmentation: the free space gets chopped into little pieces of different sizes and is thus fragmented; subsequent re- quests may fail because there is no single contiguous space that can satisfy the request, even though the total amount of free space exceeds the size of the request.

![free-used-free](https://i.ibb.co/85Nywtx/free-used-free.png)

# Assumptions

We assume a basic interface such as that provided by `*malloc(size_t size)` and `void free(void *ptr)`.

The user, when freeing the space, does not inform the library of its size; thus, the library must be able to figure out how big a chunk of memory is when handed just a pointer to it.

We further assume that primarily we are concerned with **external fragmentation**, as described above.

Allocators could of course also have the problem of **internal fragmentation**; if an allocator hands out chunks of memory bigger than that requested, any unasked for (and thus unused) space in such a chunk is considered internal fragmentation (because the waste occurs inside the allocated unit) and is another example of space waste.

We’ll also assume that once memory is handed out to a client, it cannot be relocated to another location in memory.

Finally, we’ll assume that the allocator manages a contiguous region of bytes.

In some cases, an allocator could ask for that region to grow; for example, a user-level memory-allocation library might call into the kernel to grow the heap (via a system call such as sbrk) when it runs out of space.

# Low-level Mechanisms

## Splitting and Coalescing

A free list contains a set of elements that describe the free space still re- maining in the heap. Thus, assume the following 30-byte heap:

![free-used-free](https://i.ibb.co/85Nywtx/free-used-free.png)

A request for anything greater than 10 bytes will fail (returning NULL)

A request for exactly that size (10 bytes) could be satisfied easily by either of the free chunks

But what happens if the request is for something smaller than 10 bytes. Assume we have a request for just a single byte of memory. In this case, the allocator will perform an action known as splitting: it will find a free chunk of memory that can satisfy the request and split it into two. The first chunk it will return to the caller; the second chunk will remain on the list.

![splitting](https://i.ibb.co/WVgYJG3/splitting.png)

A corollary mechanism found in many allocators is known as **coalescing of free space**. Take our example from above once more (free 10 bytes, used 10 bytes, and another free 10 bytes).

Given this (tiny) heap, what happens when an application calls free(10), thus returning the space in the middle of the heap? If we simply add this free space back into our list without too much thinking, we might end up with a list that looks like this:

![coalescing](https://i.ibb.co/MZ9HdWs/coalescing.png)

Note the problem: while the entire heap is now free, it is seemingly divided into three chunks of 10 bytes each. Thus, if a user requests 20 bytes, a simple list traversal will not find such a free chunk, and return failure.

The idea is simple: when returning a free chunk in memory, look carefully at the addresses of the chunk you are returning as well as the nearby chunks of free space; if the newly- freed space sits right next to one (or two, as in this example) existing free chunks, merge them into a single larger free chunk. Thus, with coalesc- ing, our final list should look like this:

![merge](https://i.ibb.co/2sj3dHL/merge.png)

## Tracking The Size Of Allocated Regions

Most allocators store a little bit of extra information in a header block which is kept in memory, usually just before the handed-out chunk of memory.

The header minimally contains the size of the allocated region. It may also contain additional pointers to speed up deallocation, a magic number to provide additional integrity checking, and other information.

![figure 17.1 17.2](https://i.ibb.co/PZx7pQw/17-1-17-2.png)

## Embedding A Free List

Assume we have a 4096-byte chunk of memory to manage (i.e., the heap is 4KB). To manage this as a free list, we first have to initialize said list; initially, the list should have one entry, of size 4096 (minus the header size). Here is the description of a node of the list:

```c
typedef struct __node_t {
    int              size;
    struct __node_t *next;
} node_t;
```

After initalizing the list, we have the following heap:

![figure 17.3](https://i.ibb.co/ckFdcKW/17-3.png)

Now, let’s imagine that a chunk of memory is requested, say of size 100 bytes. To service this request, the library will:

1. Find a chunk that is large enough to accommodate the request; because there is only one free chunk (size: 4088), this chunk will be chosen.
2. The chunk will be split into two: one chunk big enough to service the request (and header, as described above), and the remaining free chunk. Assuming an 8-byte header (an integer size and an integer magic number), the space in the heap now looks like

![figure 17.4](https://i.ibb.co/hyCDX95/17-4.png)

Thus, upon the request for 100 bytes, the library allocated 108 bytes out of the existing one free chunk, returns a pointer (marked ptr in the figure above) to it, stashes the header information immediately before the allocated space for later use upon free(), and shrinks the one free node in the list to 3980 bytes (4088 minus 108).

## Growing The Heap

The simplest approach is just to fail. In some cases this is the only option, and thus returning NULL is an honorable approach.

Most traditional allocators start with a small-sized heap and then re- quest more memory from the OS when they run out.

# Basic Strategies

## Best Fit

1. Search through the free list and find chunks of free memory that are as big or bigger than the requested size
2. Return the one that is the smallest in that group of candidates; this is the so called best-fit chunk (it could be called smallest fit too)

The intuition behind best fit is simple: by returning a block that is close to what the user asks, best fit tries to reduce wasted space. However, there is a cost; naive implementations pay a heavy performance penalty when performing an exhaustive search for the correct free block.

## Worst Fit

The worst fit approach is the opposite of best fit; find the largest chunk and return the requested amount; keep the remaining (large) chunk on the free list.

Worst fit tries to thus leave big chunks free instead of lots of small chunks that can arise from a best-fit approach.

Once again, however, a full search of free space is required, and thus this approach can be costly. Worse, most studies show that it performs badly, leading to excess fragmentation while still having high overheads.

## First Fit

The first fit method simply finds the first block that is big enough and returns the requested amount to the user. As before, the remaining free space is kept free for subsequent requests.

First fit has the advantage of speed — no exhaustive search of all the free spaces are necessary — but sometimes pollutes the beginning of the free list with small objects.

Thus, how the allocator manages the free list’s order becomes an issue. One approach is to use address-based ordering; by keeping the list ordered by the address of the free space, coalescing becomes easier, and fragmentation tends to be reduced.

## Next Fit

Instead of always beginning the first-fit search at the beginning of the list, the next fit algorithm keeps an extra pointer to the location within the list where one was looking last.

The idea is to spread the searches for free space throughout the list more uniformly, thus avoiding splintering of the beginning of the list.

The performance of such an approach is quite similar to first fit, as an exhaustive search is once again avoided.

# Other Approaches

## Segregated Lists

The basic idea is simple: if a particular application has one (or a few) popular-sized request that it makes, keep a separate list just to manage objects of that size; all other requests are forwarded to a more general memory allocator.

Pros: by having a chunk of memory dedicated for one particular size of requests, fragmentation is much less of a concern; moreover, allocation and free requests can be served quite quickly when they are of the right size, as no complicated search of a list is required.

Cons: how much memory should one dedicate to the pool of memory that serves specialized requests of a given size, as opposed to the general pool? - One particular allocator, the slab allocator by uber-engineer Jeff Bonwick (which was designed for use in the Solaris kernel), handles this issue in a rather nice way.

## Buddy Allocation

In such a system, free memory is first conceptually thought of as one big space of size 2^N.

When a request for memory is made, the search for free space recursively divides free space by two until a block that is big enough to accommodate the request is found (and a further split into two would result in a space that is too small). At this point, the requested block is returned to the user.

When freeing a block (i.e 8KB) to the free list, the allocator checks whether the “buddy” same-size-block is free; if so, it coalesces the two blocks (i.e into a 16KB block).

This recursive coalescing process continues up the tree, either restoring the entire free space or stopping when a buddy is found to be in use.

![figure 17.8](https://i.ibb.co/jGDcxSR/17-8.png)

Pros: simple to determine the buddy of a particular block: the address of each buddy pair only differs by a single bit; which bit is determined by the level in the buddy tree.

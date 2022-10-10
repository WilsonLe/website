---
title: CS372 Chapter 20 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Beyond Physical Memory (Policies)
---

# Table of content

- [Table of content](#table-of-content)
- [Cache Management](#cache-management)
- [The Optimal Replacement Policy](#the-optimal-replacement-policy)
- [A Simple Policy: FIFO](#a-simple-policy-fifo)
- [Another Simple Policy: Random](#another-simple-policy-random)
- [Using History: LRU \& LFU](#using-history-lru--lfu)
- [Workload Examples](#workload-examples)
  - [No Locality](#no-locality)
  - [80-20](#80-20)
  - [Loop Sequential](#loop-sequential)
- [Implementing Historical Algorithms](#implementing-historical-algorithms)
- [Approximating LRU](#approximating-lru)
- [Considering Dirty Pages](#considering-dirty-pages)
- [Other VM Policies](#other-vm-policies)
- [Thrashing](#thrashing)

# Cache Management

Our goal in picking a replacement policy for this cache is to minimize the number of cache misses, i.e., to minimize the number of times that we have to fetch a page from disk. Alternately, one can view our goal as maximizing the number of cache hits, i.e., the number of times a page that is accessed is found in memory.

The average memory access time can be calculated by:

![amat-formulae](https://i.ibb.co/yPCXDPp/amat-formulae.png)
Tm represents cost of accessing memory

Td represents cost of accessing disk

Pmiss represent the probability of not finding the data (ranges from 0 to 1)

# The Optimal Replacement Policy

The optimal replacement policy leads to the fewest number of misses overall. Belady showed that a simple (but, unfortunately, difficult to implement!) approach that replaces the page that will be accessed furthest in the future is the optimal policy, resulting in the fewest-possible cache misses.

Hopefully, the intuition behind the optimal policy makes sense. Think about it like this: if you have to throw out some page, why not throw out the one that is needed the furthest from now? By doing so, you are essentially saying that all the other pages in the cache are more important than the one furthest out. The reason this is true is simple: you will refer to the other pages before you refer to the one furthest out.

![figure 22.1](https://i.ibb.co/tzLLK33/22-1.png)

The first three accesses are misses, as the cache begins in an empty state; such a miss is sometimes referred to as a cold-start miss.

Then we refer again to pages 0 and 1, which both hit in the cache.

Finally, we reach another miss (to page 3), but this time the cache is full; a re- placement must take place.

With the optimal policy, we examine the future for each page currently in the cache (0, 1, and 2), and see that 0 is accessed almost immediately, 1 is accessed a little later, and 2 is accessed furthest in the future. Thus the optimal policy has an easy choice: evict page 2, resulting in pages 0, 1, and 3 in the cache.

Here the optimal policy again examines the future for each page in the cache (0, 1, and 3), and sees that as long as it doesn’t evict page 1 (which is about to be accessed), we’ll be OK. The example shows page 3 getting evicted, although 0 would have been a fine choice too. Finally, we hit on page 1 and the trace completes.

We can also calculate the hit rate for the cache: with 6 hits and 5 misses, the hit rate 54.5%.

# A Simple Policy: FIFO

Pages were simply placed in a queue when they enter the system; when a replacement occurs, the page on the tail of the queue (the “first-in” page) is evicted. FIFO has one great strength: it is quite simple to implement.

Comparing FIFO to optimal, FIFO does notably worse: a 36.4% hit rate (or 57.1% excluding compulsory misses). FIFO simply can’t deter- mine the importance of blocks: even though page 0 had been accessed a number of times, FIFO still kicks it out, simply because it was the first one brought into memory.

![figure 22.2](https://i.ibb.co/5TSVzVM/22-2.png)

# Another Simple Policy: Random

Another similar replacement policy is Random, which simply picks a random page to replace under memory pressure. Random has properties similar to FIFO; it is simple to implement, but it doesn’t really try to be too intelligent in picking which blocks to evict.

![figure 22.3](https://i.ibb.co/31ZYRjf/22-3.png)

# Using History: LRU & LFU

The Least-Frequently-Used (LFU) policy replaces the least-frequently-used page when an eviction must take place. Similarly, the Least-Recently-Used (LRU) policy replaces the least-recently-used page.

These algorithms are easy to remember: once you know the name, you know exactly what it does, which is an excellent property for a name.

![figure 22.5](https://i.ibb.co/MZnJJmx/22-5.png)

# Workload Examples

## No Locality

Each reference is to a random page within the set of accessed pages.

In the experiment, we vary the cache size from very small (1 page) to enough to hold all the unique pages (100 page), in order to see how each policy behaves over the range of cache sizes.

![figure 22.6](https://i.ibb.co/frmtSLT/22-6.png)

Several conclusion:

1. When there is no locality in the workload, it doesn’t matter much which realistic policy you are using; LRU, FIFO, and Random all perform the same, with the hit rate exactly determined by the size of the cache.
2. When the cache is large enough to fit the entire workload, it also doesn’t matter which policy you use; all policies (even Random) converge to a 100% hit rate when all the referenced blocks fit in cache.
3. Optimal performs noticeably better than the realistic policies; peeking into the future, if it were possible, does a much better job of replacement.

## 80-20

80% of the references are made to 20% of the pages (the “hot” pages); the remaining 20% of the references are made to the remaining 80% of the pages (the “cold” pages)

![figure 22.7](https://i.ibb.co/hBys8Vk/22-7.png)

While both random and FIFO do reasonably well, LRU does better, as it is more likely to hold onto the hot pages; as those pages have been referred to frequently in the past, they are likely to be referred to again in the near future.

Optimal once again does better, showing that LRU’s historical information is not perfect.

## Loop Sequential

We refer to 50 pages in sequence, starting at 0, then 1, ..., up to page 49, and then we loop, repeating those accesses, for a total of 10,000 accesses to 50 unique pages.

![figure 22.8](https://i.ibb.co/CQD0vB9/22-8.png)

This represents a worst-case for both LRU and FIFO. Interestingly, Random fares notably better, not quite ap- proaching optimal, but at least achieving a non-zero hit rate. Turns out that random has some nice properties; one such property is not having weird corner-case behaviors.

# Implementing Historical Algorithms

As you can see, an algorithm such as LRU can generally do a better job than simpler policies like FIFO or Random, which may throw out important pages. Unfortunately, historical policies present us with a new challenge: how do we implement them?

To keep track of which pages have been least- and most-recently used, the system has to do some accounting work on every memory reference. Clearly, without great care, such accounting could greatly reduce performance.

One method that could help speed this up is to add a little bit of hardware support: For example, a machine could update, on each page access, a time field in memory. Thus, when a page is accessed, the time field would be set, by hardware, to the current time. Then, when replacing a page, the OS could simply scan all the time fields in the system to find the least-recently-used page.

Unfortunately, as the number of pages in a system grows, scanning a huge array of times just to find the absolute least-recently-used page is prohibitively expensive.

# Approximating LRU

As it turns out, the answer is yes: approximating LRU is more feasible from a computational-overhead standpoint, and indeed it is what many modern systems do.

Consider Clock Algorith:

The idea requires some hardware support, in the form of a use bit. There is one use bit per page of the system, and the use bits live in memory somewhere (they could be in the per-process page tables, for example, or just in an array somewhere).

Whenever a page is referenced (i.e., read or written), the use bit is set by hardware to 1. The hardware never clears the bit, though (i.e., sets it to 0); that is the responsibility of the OS.

Imagine all the pages of the system arranged in a circular list. A clock hand points to some particular page to begin with. When a replacement must occur, the OS checks if the currently-pointed to page P has a use bit of 1 or 0.

If 1, this implies that page P was recently used and thus is not a good candidate for replacement. Thus, the use bit for P set to 0 (cleared), and the clock hand is incremented to the next page (P + 1).

The algorithm continues until it finds a use bit that is set to 0, implying this page has not been recently used (or, in the worst case, that all pages have been and that we have now searched through the entire set of pages, clearing all the bits).

![figure 22.9](https://i.ibb.co/9TJnXvM/22-9.png)

Note that this approach is not the only way to employ a use bit to approximate LRU. Indeed, any approach which periodically clears the use bits and then differentiates between which pages have use bits of 1 versus 0 to decide which to replace would be fine. The clock algorithm of Corbato’s was just one early approach which met with some success, and had the nice property of not repeatedly scanning through all of memory looking for an unused page.

# Considering Dirty Pages

One small modification to the clock algorithm that is commonly made is the additional con- sideration of whether a page has been modified or not while in memory.

The reason for this: if a page has been modified and is thus dirty, it must be written back to disk to evict it, which is expensive. If it has not been modified (and is thus clean), the eviction is free; the physical frame can simply be reused for other purposes without additional I/O. Thus, some VM systems prefer to evict clean pages over dirty pages.

To support this behavior, the hardware should include a modified bit (a.k.a. dirty bit). This bit is set any time a page is written, and thus can be incorporated into the page-replacement algorithm. The clock algorithm, for example, could be changed to scan for pages that are both unused and clean to evict first; failing to find those, then for unused pages that are dirty, and so forth.

# Other VM Policies

Page replacement is not the only policy the VM subsystem employs. For example, the OS also has to decide when to bring a page into memory. This policy, sometimes called the page selection policy presents the OS with some different options.

For most pages, the OS simply uses demand paging, which means the OS brings the page into memory when it is accessed, “on demand” as it were.

Of course, the OS could guess that a page is about to be used, and thus bring it in ahead of time; this behavior is known as prefetching and should only be done when there is reasonable chance of success. For example, some systems will assume that if a code page P is brought into memory, that code page P+1 will likely soon be accessed and thus should be brought into memory too.

Another policy determines how the OS writes pages out to disk. Of course, they could simply be written out one at a time; however, many systems instead collect a number of pending writes together in memory and write them to disk in one (more efficient) write.

This behavior is usually called clustering or simply grouping of writes, and is effective because of the nature of disk drives, which perform a single large write more efficiently than many small ones.

# Thrashing

What should the OS do when memory is simply oversubscribed, and the memory demands of the set of running processes simply exceeds the available physical memory? In this case, the system will constantly be paging, a condition sometimes referred to as thrashing.

One solution: a system could decide to only run a subset of processes, with the hope that the reduced set of processes’ working sets (the pages that they are using actively) fit in memory and thus can make progress. This approach, generally known as admission control, states that it is sometimes better to do less work well than to try to do everything at once poorly.

Another solution is to chooses a memory-intensive process and kills it, thus reducing memory in a none-too-subtle manner.

While successful at reducing memory pressure, this approach can have problems, if, for example, it kills the X server and thus renders any applications requiring the display unusable.

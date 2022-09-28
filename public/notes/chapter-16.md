---
title: CS372 Chapter 16 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Segmentation
---

# Table of content

- [Table of content](#table-of-content)
- [Segmentation: Generalized Base/Bounds](#segmentation-generalized-basebounds)
- [Which Segment Are We Referring To?](#which-segment-are-we-referring-to)
- [What About The Stack?](#what-about-the-stack)
- [Support for Sharing](#support-for-sharing)
- [Fine-grained vs. Coarse-grained Segmentation](#fine-grained-vs-coarse-grained-segmentation)
- [OS Support](#os-support)

# Segmentation: Generalized Base/Bounds

Instead of having just one base and bounds pair in our MMU, why not have a base and bounds pair per logical **segment** of the address space?

A segment is just a **contiguous portion** of the address space of a particular length, and in our canonical address space, we have three logically-different segments: code, stack, and heap.

What segmentation allows the OS to do is to place each one of those segments in different parts of physical memory, and thus avoid filling physical memory with unused virtual address space.

For example, with a base and bounds pair per segment, we can place each segment independently in physical memory.

![figure 16.2](https://i.ibb.co/YTv7svm/16-1.png)

As you can see in the diagram, only used memory is allocated space in physical memory, and thus large address spaces with large amounts of unused address space (which we sometimes call sparse address spaces) can be accommodated.

The hardware structure in our MMU required to support segmenta- tion is just what you’d expect: in this case, a set of three base and bounds register pairs.

![figure 16.3](https://i.ibb.co/cQJcq23/16-2.png)

Assume a reference is made to virtual address 100. When the reference takes place (say, on an instruction fetch):

1. Hardware will add the base value to the offset into this segment (100 in this case) to arrive at the desired physical address: 100 + 32KB, or 32868.
2. Check that the address is within bounds (100 is less than 2KB), find that it is
3. Issue the reference to physical memory address 32868.

Now let’s look at an address in the heap, virtual address 4200.

1. Extract the offset into the heap, i.e., which byte(s) in this segment the address refers to. The offset of 4200 is actually 4200 minus 4096, or 104.
2. Add it to the base register physical address (34K) to get the desired result: 34920.

If user tries to refer to an illegal address, the hardware detects that the address is out of bounds, traps into the OS, likely leading to the termination of the offending process.

# Which Segment Are We Referring To?

The hardware uses segment registers during translation. How does it know the offset into a segment, and to which segment an address refers?

One common approach, sometimes referred to as an **explicit approach**, is to chop up the address space into segments based on the top few bits of the virtual address.

In our example above, we have three segments; thus we need two bits to accomplish our task. If we use the top two bits of our 14-bit virtual address to select the segment, our virtual address looks like this:

![segment-offset-1](https://i.ibb.co/6ZXm50L/segment-offset-1.png)

In our example, then, if the top two bits are 00, the hardware knows the virtual address is in the code segment, and thus uses the code base and bounds pair to relocate the address to the correct physical location. 01 refers to heaps, like this diagram below.

![segment-off-set-2](https://i.ibb.co/T8J3b2d/segment-offset-2.png)

# What About The Stack?

The stack grows **backwards**, refering to the diagram above, it “starts” at 28KB1 and grows back to 26KB, corresponding to virtual addresses 16KB to 14KB; translation must proceed differently.

The first thing we need is a little extra hardware support. Instead of just base and bounds values, the hardware also needs to know which way the segment grows.

![figure 16.4](https://i.ibb.co/mRZ1CqB/16-3.png)

With the hardware understanding that segments can grow in the neg- ative direction, the hardware must now translate such virtual addresses slightly differently:

1. Subtract the maximum segment size from 3KB: 3KB - 4KB = -1KB.
2. We simply add the negative offset (-1KB) to the base (28KB) to arrive at the correct physical address: 27KB.
3. The bounds check can be calculated by ensuring the absolute value of the negative offset is less than or equal to the segment’s current size (in this case, 2KB).

# Support for Sharing

As support for segmentation grew, system designers soon realized that they could realize new types of efficiencies with a little more hardware support. Specifically, to save memory, sometimes it is useful to share certain memory segments between address spaces. In particular, code sharing is common and still in use in systems today.

To support sharing, we need a little extra support from the hardware, in the form of **protection bits**. Basic support adds a few bits per segment, indicating whether or not a program can read or write a segment, or perhaps execute code that lies within the segment.

By setting a code segment to read-only, the same code can be shared across multiple processes, without worry of harming isolation; while each process still thinks that it is accessing its own private memory, the OS is secretly sharing memory which cannot be modified by the process, and thus the illusion is preserved.

![figure 16.5](https://i.ibb.co/qsXW3bk/16-5.png)

With protection bits, the hardware algorithm described earlier would also have to change. In addition to checking whether a virtual address is within bounds, the hardware also has to check whether a particular access is permissible. If a user process tries to write to a read-only segment, or execute from a non-executable segment, the hardware should raise an exception, and thus let the OS deal with the offending process.

# Fine-grained vs. Coarse-grained Segmentation

Most of our examples thus far have focused on systems with just a few segments (i.e., code, stack, heap). The larger the segments, the more **coarse** it is, and the smaller the segments, the more **fine** it is.

Supporting many segments requires even further hardware support, with a segment table of some kind stored in memory. Such segment tables usually support the creation of a very large number of segments, and thus enable a system to use segments in more flexible ways than we have thus far discussed.

![figure 16.6](https://i.ibb.co/M1Hr07f/16-6.png)

# OS Support

- Problem 1: What should the OS do on a context switch?

Each process has its own virtual address space, and the OS must make sure to set up these registers correctly before letting the process run again.

- Problem 2: OS interaction when segments grow (or perhaps shrink). For example, a program may call malloc() to allocate an object.

In some cases, the existing heap will be able to service the request, and thus `malloc()` will find free space for the object and return a pointer to it to the caller. In others, however, the heap segment itself may need to grow. In this case, the memory-allocation library will perform a system call to grow the heap.

The OS will then (usually) provide more space, updating the segment size register to the new (bigger) size, and informing the library of success; the library can then allocate space for the new object and return successfully to the calling program. Do note that the OS could reject the request, if no more physical memory is available, or if it decides that the calling process already has too much.

- Problem 3: Managing free space in physical memory. When a new address space is created, the OS has to be able to find space in physical memory for its segments.

The general problem that arises is that physical memory quickly becomes full of little holes of free space, making it difficult to allocate new segments, or to grow existing ones. We call this problem **external fragmentation**

One solution to this problem would be to compact physical memory by rearranging the existing segments.

For example, the OS could stop whichever processes are running, copy their data to one contiguous region of memory, change their segment register values to point to the new physical locations, and thus have a large free extent of memory with which to work.

A simpler approach might instead be to use a free-list management algorithm that tries to keep large extents of memory available for allocation.

There are literally hundreds of approaches that people have taken, including classic algorithms like **best-fit**, **worst-fit**, **first-fit**, and more complex schemes like **buddy algorithm**.

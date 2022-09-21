---
title: CS372 Chapter 10 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: The Abstraction - Address Spaces
---

# Table of content

- [Table of content](#table-of-content)
- [Early Systems](#early-systems)
- [Multiprogramming and Time Sharing](#multiprogramming-and-time-sharing)
- [The Address Space](#the-address-space)
- [Goals](#goals)
  - [Transparancy](#transparancy)
  - [Efficiency](#efficiency)
  - [Protection](#protection)

# Early Systems

Early machines didn’t provide much of an abstraction to users.

![early systems figure](https://i.ibb.co/tZDP4Jy/early-systems.png)

The OS was a set of routines (a library, really) that sat in memory (starting at physical address 0 in this example), and there would be one running program (a process) that currently sat in physical memory (starting at physical address 64k in this example) and used the rest of memory.

# Multiprogramming and Time Sharing

Multiprogramming refers to having multiple processes ready to run at a given time, and the OS would switch between them, for example when one decided to perform an I/O. Doing so increased the effective utilization of the CPU.

The notion of interactivity became important, as many users might be concurrently using a machine, each waiting for (or hoping for) a timely response from their currently-executing tasks.

One way to implement time sharing would be to run one process for a short while, giving it full access to all memory, then stop it, save all of its state to some kind of disk (including all of physical memory), load some other process’s state, run it for a while, and thus implement some kind of crude sharing of the machine.

Unfortunately, this approach is way too slow, particularly as memory grows. Saving the entire contents of memory to disk is brutally non-performant. What we’d rather do is leave processes in memory while switching between them, allowing the OS to implement time sharing efficiently.

![time sharing figure](https://i.ibb.co/9Z4146z/time-sharing.png)

# The Address Space

The OS creates an easy to use abstraction of physical memory, called the address space, and it is the running program’s view of memory in the system.

The address space of a process contains all of the memory state of the running program.

The code of the program (the instructions) live in the address space.

The program, while it is running, uses a stack to keep track of where it is in the function call chain as well as to allocate local variables and pass parameters and return values to and from routines.

The heap is used for dynamically-allocated, user-managed memory, such as that you might receive from a call to malloc() in C or new in an object-oriented language such as C++ or Java.

![address space](https://i.ibb.co/YfsLBz6/address-space.png)

The program code lives at the top of the address space because it is static, meaning it won’t need any more space as the program runs.

Next, we have the two regions of the address space that may grow (and shrink) while the program runs. Those are the heap (at the top) and the stack (at the bottom). We place them like this because each wishes to be able to grow, and by putting them at opposite ends of the address space, we can allow such growth: they just have to grow in opposite directions.

Of course, when we describe the address space, what we are describing is the abstraction that the OS is providing to the running program.

The OS build this abstraction of a private, potentially large address space for multiple running processes (all sharing memory) on top of a single, physical memory. When the OS does this, we say the OS is virtualizing memory, because the running program thinks it is loaded into memory at a particular address (say 0) and has a potentially very large address space (say 32-bits or 64-bits);

When a process tries to perform a load, somehow the OS, in tandem with some hardware support, will have to make sure the load doesn’t actually go to physical address 0 but rather to some other physical address (where the process is loaded into memory). This is the key to virtualization of memory, which underlies every modern computer system in the world.

# Goals

## Transparancy

The OS should implement virtual memory in a way that is invisible to the running program. Thus, the program shouldn’t be aware of the fact that memory is virtualized; rather, the program behaves as if it has its own private physical memory.

## Efficiency

The OS should strive to make the virtualization as efficient as possible, both in terms of time (i.e., not making programs run much more slowly) and space (i.e., not using too much memory for structures needed to support virtualization)

## Protection

The OS should make sure to protect processes from one another as well as the OS itself from processes. When one process performs a load, a store, or an instruction fetch, it should not be able to access or affect in any way the memory contents of any other process or the OS itself (that is, anything outside its address space).

Protection thus enables us to deliver the property of isolation among processes; each process should be running in its own isolated cocoon, safe from the ravages of other faulty or even malicious processes.

---
title: CS372 Chapter 3-4 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Operating System's Processes
---

# Table of content

- [Table of content](#table-of-content)
- [Process](#process)
	- [Abstraction: The Process](#abstraction-the-process)
	- [Process API](#process-api)
	- [Process Creation](#process-creation)
	- [Process States](#process-states)
	- [Data Structure](#data-structure)

# Process

Chapter 4 discusses process, one of the most fundamental abstractions that the OS provides to users. Informally, the process is a running program. Program is basically instructions stored as bytes in hard disks, waiting to be executed. There can be multiple processes running a single program, but not vice versa.

A computer will run a large number of programs - processes - at the same time. This is achieved by virtualizing the CPU: running Process 1, stopping Process 1, running Process 2, and so on, the OS can make it seems like virtual CPUs exist when in fact there are only a few physical CPUs.

One basic technique known as **time sharing** allows user to concurrently run programs as many times as the user wants. The potential cost is performance, as each process will run more slowly if the CPU's must be shared. To implementment CPU virtualization, OS need low-level machinery (mechanism) and high-level intelligence (policies).

## Abstraction: The Process

The abstraction provided by the OS of a running program is something we will call a **process**. Machine state is what a program can read or update when it is running, which might include: memory, registers, persistent storage devices.

A thread is a light weight process. A process can spawn in multiple threads. While processes has independent address space, threads share the same address space.

## Process API

1. Create new process
2. Destroy a running process
3. Wait for a process to stop running
4. Miscellaneous control, i.e: stop a processing from running for a while, then resume it
5. Status of a process (how long it has run for, what state it is in)

## Process Creation

1. Load program from disk in some form of executable format
   - Early OS load program eagerly (loads all instructions at once at the moment of process creation)
   - Modern OS loads program lazily (only load instructions that are needed at process's runtime) - kinda like streaming in instruction as necessary.
2. Allocate memory to program's run-time stack or heap
3. Start the program at the entry point

## Process States

Execution stream (stream of instruction) in the context of process state (everything affected by the process, i.e registers, heaps, stacks). When a process exit, all these has to be reserve.

A process can be in one of 3 states:

1. Running on a processor. This means it is executing instructions.
2. Ready to run but for some reason the OS has chosen not to run it at this given moment.
3. Blocked: In the blocked state, a process has performed some kind of operation that makes it not ready to run until some other event takes place. A common example: when a process initiates an I/O request to a disk, it becomes blocked and thus some other process can use the processor.

Deciding states of processes to optimize performance is the job of the OS **scheduler**

Sometimes a system will have an **initial state** that the process is in when it is **being** created. Also, a process could be placed in a **final state** where it has exited but has **not yet** been cleaned up.

## Data Structure

OS likely will keep some kind of process list for all processes that are ready, currently running, and blocked. The **register context** will hold the contents of its registers. When a process is stopped, its registers will be saved to this memory location, which can be restored and resume running the process. This technique is called **context switch**.

**Process lists**: consists of a bunch of control blocks. **Control blocks** manages all process states. Abstractly we use a list, but specific implementation depends on scheduler policy.

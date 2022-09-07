---
title: CS372 Chapter 6 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Limited Direct Execution
---

# Table of content

- [Table of content](#table-of-content)
- [Limited Direct Execution](#limited-direct-execution)
- [Restricted Operations](#restricted-operations)
- [Switching Between Processes](#switching-between-processes)
	- [Cooperative Approach](#cooperative-approach)
	- [Non-Cooperative Approach](#non-cooperative-approach)
	- [Saving and Restoring Context](#saving-and-restoring-context)
	- [Worried About Concurrency?](#worried-about-concurrency)

# Limited Direct Execution

The “direct execution” part of the idea is simple: just run the program directly on the CPU: creates a process entry in a process list, allocates memory, loads the program code into memory, locates entry point, jump to it, and starts executing the code.

Problems with direct execution:

1. How can the OS make sure the program doesn’t do anything that we don’t want it to do, while still running it efficiently
2. When we are running a process, how does the operating system stop it from running and switch to another process

The “limited” part of the name arises from solving these problems. Without limits on running programs, the OS wouldn’t be in control of anything and thus would be “just a library” (of system calls)

# Restricted Operations

Direct execution is fast because a program runs natively on the CPU. Thus comes the problem of what if the process wishes to perform some kind of restricted operation such as:

- Issuing an I/O request to a disk
- Gaining access to more system resources such as CPU or memory

We introduce a new processor mode, known as **user mode**: code that runs in user mode is restricted in what it can do. An exeption will be raised if the process attempts to do something it's not allowed to do.

In contrast to user mode is **kernel mode**, which the operating system (or kernel) runs in. In this mode, code that runs can do what it likes, including privileged operations such as issuing I/O requests and executing all types of restricted instructions.

What if **user mode** process wish to do priviledged operations? All modern hardware provides the ability for user programs to perform a system call, allowing the kernel to carefully expose certain key pieces of functionality to user programs, such as:

- Accessing the file system
- Creating and destroying processes
- Communicating with other processes
- Allocating more memory

The process that is in user mode will execute a special _trap instruction_ which temporarily turn **user mode** into **kernel mode**, which then execute those priviledge operation, then execute the special _return-from-trap instruction_ to return to **user mode**.

When executing a trap, in that it must make sure to save enough of the caller’s registers in order to be able to return correctly when the OS issues the return-from-trap instruction.

How does the trap know which code to run inside the OS? The kernel does so by setting up a **trap table** at boot time. When the machine boots up, it does so in privileged (kernel) mode, and thus is free to configure machine hardware as need be.

One of the first things the OS thus does is to tell the hardware what code to run when certain exceptional events occur.

The OS informs the hardware of the locations of these trap handlers, usually with some kind of special instruction. Once the hardware is informed, it remembers the location of these handlers until the machine is next rebooted, and thus the hardware knows what to do (i.e., what code to jump to) when system calls and other exceptional events take place.

# Switching Between Processes

With direct execution, while the CPU is running the process, the OS is **not running**, and thus, could not regain control. How can the operating system regain control of the CPU so that it can switch between processes?

## Cooperative Approach

The OS trusts the processes of the system to behave reasonably. Processes that run for too long are assumed to periodically give up the CPU so that the OS can decide to run some other task.

The OS regains control of the CPU by waiting for a system call or an illegal operation of some kind to take place. Problem with this is that the process might never make a system call, and the OS never regain control (i.e the process is stuck in an infinite loop).

## Non-Cooperative Approach

A timer device can be programmed to raise an interrupt every so many milliseconds; when the interrupt is raised, the currently running process is halted, a pre-configured interrupt handler in the OS runs, and the OS has regained control of the CPU.

At boot time, the OS inform the hardware of which code to run when the timer interrupt occurs. During the boot sequence, the OS must start the timer, which is of course a privileged operation. Once the timer has begun, the OS can thus feel safe in that control will eventually be returned to it, and thus the OS is free to run user programs.

## Saving and Restoring Context

While the CPU regain control, it has to make a decision whether to continue the current process, or switch to a different one. This decision is made by a part of the operating system known as the scheduler.

If the decision is made to switch, the OS then executes a low-level piece of code which we refer to as a context switch: save a few register values for the currently-executing process (onto its kernel stack) and restore a few for the soon-to-be-executing process (from its kernel stack).

By doing so, the OS thus ensures that when the return-from-trap instruction is finally executed, instead of returning to the process that was running, the system resumes execution of another process.

## Worried About Concurrency?

Plausiable questions:

- What happens when, during a system call, a timer interrupt occurs?
- What happens when you’re handling one interrupt and another one happens?

The answer is yes, the OS does indeed need to be concerned as to what happens if, during interrupt or trap handling, another interrupt occurs. One simple thing an OS might do is disable interrupts during interrupt processing; doing so ensures that when one interrupt is being handled, no other one will be delivered to the CPU.

Further details will be discussed later in the books

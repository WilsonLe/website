---
title: CS372 Chapter 25-26 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Introduction To Concurrency
---

# Table of content

- [Table of content](#table-of-content)
- [Introduction To Concurrency](#introduction-to-concurrency)
- [Why Use Threads](#why-use-threads)
- [An Example: Thread Creation](#an-example-thread-creation)
- [Why It Gets Worse: Shared Data](#why-it-gets-worse-shared-data)
- [The Heart Of The Problem: Uncontrolled Scheduling](#the-heart-of-the-problem-uncontrolled-scheduling)
- [The Wish For Atomicity](#the-wish-for-atomicity)
- [One More Problem: Waiting For Another](#one-more-problem-waiting-for-another)

# Introduction To Concurrency

There are certain types of programs that we call multi-threaded applications; each thread is kind of like an independent agent running around in this program, doing things on the program’s behalf. But these threads access memory, and for them, each spot of memory is up for grabs. If we don’t coordinate access to memory between threads, the program won’t work as expected.

The OS must support multi-threaded applications with primitives such as **locks** and **condition variables**. The OS itself was the first concurrent program — it must access its own memory very carefully or many strange and terrible things will happen.

A multi-threaded program has more than one point of execution. Each thread is very much like a separate process, except for one difference: they share the same address space and thus can access the same data. Other than that, a thread has its own PC, registers.

Context switch between 2 threads is similar to process's context switch: register state of T1 must be saved and the register state of T2 restored before running T2. With processes, we saved state to a process control block (PCB); now, we’ll need one or more thread control blocks (TCBs) to store the state of each thread of a process.

![figure 26.1](https://i.ibb.co/cQf52kn/26-1.png)

# Why Use Threads

The first is simple: **parallelism**. Imagine you are writing a program that performs operations on very large arrays, for example, adding two large arrays together, or incrementing the value of each element in the array by some amount.

The second reason is a bit more subtle: to avoid blocking program progress due to slow I/O. Imagine that you are writing a program that performs different types of I/O: either waiting to send or receive a message, for an explicit disk I/O to complete, or even (implicitly) for a page fault to finish.

# An Example: Thread Creation

Say we wanted to run a program that creates two threads, each of which does some independent work, in this case printing “A” or “B”.

```c
#include <stdio.h>
#include <assert.h>
#include <pthread.h>
#include "common.h"
#include "common_threads.h"

void *mythread(void *arg) {
  printf("%s\n", (char *) arg);
  return NULL;
}

int
main(int argc, char *argv[]) {
  pthread_t p1, p2;
  int rc;
  printf("main: begin\n");
  Pthread_create(&p1, NULL, mythread, "A");
  Pthread_create(&p2, NULL, mythread, "B");
  // join waits for the threads to finish
  Pthread_join(p1, NULL);
  Pthread_join(p2, NULL);
  printf("main: end\n");
  return 0;
}
```

![figure 26.3](https://i.ibb.co/7S0mymR/26-3.png)

![figure 26.4](https://i.ibb.co/pj17VTp/26-4.png)

After creating the two threads (let’s call them T1 and T2), the main thread calls pthread join(), which waits for a particular thread to complete. It does so twice, thus ensuring T1 and T2 will run and complete before finally allowing the main thread to run again; when it does, it will print “main: end” and exit.

![figure 26.5](https://i.ibb.co/zGkz503/26-5.png)

# Why It Gets Worse: Shared Data

When 2 threads are trying to independantly update a global variable, in the end, that global variable will yield different results after each run, thus we got a **race condition**.

# The Heart Of The Problem: Uncontrolled Scheduling

![figure 26.7](https://i.ibb.co/b2hyMS9/26-7.png)

The figure above demonstrated what's called a race condition (or, more specifically, a data race): the results depend on the timing execution of the code. With some bad luck (i.e., context switches that occur at untimely points in the execution), we get the wrong result.

In fact, we may get a different result each time; thus, instead of a nice deterministic computation (which we are used to from computers), we call this result indeterminate, where it is not known what the output will be and it is indeed likely to be different across runs.

Because multiple threads executing this code can result in a race condition, we call this code a **critical section**. A critical section is a piece of code that accesses a shared variable (or more generally, a shared resource) and must not be concurrently executed by more than one thread.

What we really want for this code is what we call mutual exclusion. This property guarantees that if one thread is executing within the critical section, the others will be prevented from doing so.

# The Wish For Atomicity

One way to solve this problem would be to have more powerful instructions that, in a single step, did exactly whatever we needed done and thus removed the possibility of an untimely interrupt.

When the instruction executed, it would perform the update as desired. It could not be interrupted mid-instruction, because that is precisely the guarantee we receive from the hardware: when an interrupt occurs, either the instruction has not run at all, or it has run to completion; there is no in-between state.

In the general case we won't have atomic instruction for everything. Thus, what we will instead do is ask the hardware for a few useful instructions upon which we can build a general set of what we call synchronization primitives.

By using this hardware support, in combination with some help from the operating system, we will be able to build multi-threaded code that accesses critical sections in a synchronized and controlled manner, and thus reliably produces the correct result despite the challenging nature of concurrent execution.

# One More Problem: Waiting For Another

There is another common interaction that arises, where one thread must wait for another to complete some action before it continues. This interaction arises, for example, when a process performs a disk I/O and is put to sleep; when the I/O completes, the process needs to be roused from its slumber so it can continue.

---
title: CS372 Chapter 9 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Proportional Share
---

# Table of content

- [Table of content](#table-of-content)
- [Basic Concept: Tickets Represent Your Share](#basic-concept-tickets-represent-your-share)
- [Ticket Mechanisms](#ticket-mechanisms)
  - [Ticket Currency](#ticket-currency)
  - [Ticket Transfer](#ticket-transfer)
  - [Ticket Inflation](#ticket-inflation)
- [Implementation](#implementation)
- [How To Assign Tickets](#how-to-assign-tickets)
- [Why Randomness](#why-randomness)
- [The Linux Completely Fair Scheduler (CFS)](#the-linux-completely-fair-scheduler-cfs)
  - [Basic Operation](#basic-operation)
  - [Weighting (Niceness)](#weighting-niceness)
  - [Using Red-Black Trees](#using-red-black-trees)
  - [Dealing With I/O And Sleeping Processes](#dealing-with-io-and-sleeping-processes)

# Basic Concept: Tickets Represent Your Share

The percent of tickets that a process has repre- sents its share of the system resource in question.

Imagine two processes, A and B, and further that A has 75 tickets while B has only 25. Thus, what we would like is for A to receive 75% of the CPU and B the remaining 25%.

# Ticket Mechanisms

## Ticket Currency

One way to manipulate tickets is the concept of **ticket currency**. Currency allows a user with a set of tick- ets to allocate tickets among their own jobs in whatever currency they would like; the system then automatically converts said currency into the correct global value.

For example, assume users A and B have each been given 100 tickets. User A is running two jobs, A1 and A2, and gives them each 500 tickets (out of 1000 total) in A’s currency. User B is running only 1 job and gives it 10 tickets (out of 10 total). The system converts A1’s and A2’s allocation from 500 each in A’s currency to 50 each in the global currency; similarly, B1’s 10 tickets is converted to 100 tickets. The lottery is then held over the global ticket currency (200 total) to determine which job runs.

```
User A  -> 500 (A’s currency) to A1 ->  50 (global currency)
        -> 500 (A’s currency) to A2 ->  50 (global currency)
User B  ->  10 (B’s currency) to B1 -> 100 (global currency)
```

## Ticket Transfer

With transfers, a process can temporarily hand off its tickets to another process.

This ability is especially useful in a client/server setting: client process sends a message to a server asking it to do some work on the client’s behalf, thus client sends tickets to server to maximize server's performance, then the server transfers the ticket (and data of course) back to the client.

## Ticket Inflation

With inflation, a process can temporarily raise or lower the number of tickets it owns.

In a competitive scenario with processes that do not trust one another, this makes little sense: one greedy process could give itself a vast number of tickets and take over the machine

When group of processes trust one another; in such a case, if any one process knows it needs more CPU time, it can boost its ticket value as a way to reflect that need to the system, all without communicating with any other processes.

# Implementation

Let’s assume we keep the processes in a list. To make a scheduling decision, we first have to pick a random number (the winner) from the total number of tickets. Let’s say we pick the number 300. Then, we simply traverse the list, with a simple counter used to help us find the winner.

The code walks the list of processes, adding each ticket value to counter until the value exceeds winner. Once that is the case, the current list el- ement is the winner.

# How To Assign Tickets

One approach is to assume that the users know best; in such a case, each user is handed some number of tickets, and a user can allocate tickets to any jobs they run as desired. However, this solution is a non-solution: it really doesn’t tell you what to do.

Thus, given a set of jobs, the “ticket-assignment problem” remains open.

# Why Randomness

While randomness gets us a simple (and approximately correct) scheduler, it occasionally will not deliver the exact right proportions, especially over short time scales. For this reason, Waldspurger invented stride scheduling, a deterministic fair-share scheduler.

Each job in the system has a stride, which is inverse in proportion to the number of tickets it has. We can compute the stride of each by dividing some large number by the number of tickets each process has been assigned. Every time a process runs, we will increment a counter for it (called its pass value) by its stride to track its global progress.

The scheduler then uses the stride and pass to determine which pro- cess should run next: at any given time, pick the process to run that has the lowest pass value so far. When you run a process, increment its pass counter by its stride.

![figure 9.3](https://i.ibb.co/Q8X63FC/9-3.png)

As we can see from the figure, C ran five times, A twice, and B just once, exactly in proportion to their ticket values of 250, 100, and 50. Lot- tery scheduling achieves the proportions probabilistically over time; stride scheduling gets them exactly right at the end of each scheduling cycle.

Lottery scheduling has one nice property that stride scheduling does not: no global state.

Imagine a new job enters in the middle of our stride scheduling example above; what should its pass value be? Should it be set to 0? If so, it will monopolize the CPU. With lottery scheduling, there is no global state per process; we simply add a new process with whatever tickets it has, update the single global variable to track how many total tickets we have, and go from there. In this way, lottery makes it much easier to incorporate new processes in a sensible manner.

# The Linux Completely Fair Scheduler (CFS)

## Basic Operation

Its goal is simple: to fairly divide a CPU evenly among all competing processes. It does so through a simple counting-based technique known as **virtual runtime (vruntime)**.

As each process runs, it accumulates vruntime. In the most basic case, each process’s vruntime increases at the same rate, in proportion with physical (real) time. When a scheduling decision occurs, CFS will pick the process with the lowest vruntime to run next.

The tension here is that CFS still has the fairness vs performance trade offs we discussed in the last chapter: increase in fairness will reduce performance (increase context switching), and increase in performace will reduce fairness (decrease context switching).

CFS manages this tension through various control parameters. The first is **sched latency**. A typical sched latency value is 48 (milliseconds); CFS divides this value by the number (n) of processes running on the CPU to determine the time slice for a process, and thus ensures that over this period of time, CFS will be completely fair.

![figure 9.4](https://i.ibb.co/hyT0Trp/9-4.png)

The figure shows an example where the four jobs (A, B, C, D) each run for two time slices in this fashion; two of them (C, D) then complete, leaving just two remaining, which then each run for 24 ms in round-robin fashion.

Another issue is when there are too many processes running, which leads to too small time slice thus too many context switches. To address this issue, CFS adds another parameter, min granularity, which is usually set to a value like 6 ms. CFS will never set the time slice of a process to less than this value, ensuring that not too much time is spent in scheduling overhead.

## Weighting (Niceness)

CFS also enables controls over process priority, enabling users or admin- istrators to give some processes a higher share of the CPU. It does this not with tickets, but through a classic UNIX mechanism known as the nice level of a process.

The nice parameter can be set anywhere from -20 to +19 for a process, with a default of 0. Positive nice values imply lower priority and negative values imply higher priority; when you’re too nice, you just don’t get as much (scheduling) attention

## Using Red-Black Trees

CFS uses **red-black-tree** to keep the processes scheduling efficient. A red-black tree is one of many types of balanced trees; in contrast to a simple binary tree (which can degenerate to list-like performance under worst-case insertion patterns), balanced trees do a little extra work to maintain low depths, and thus ensure that operations are logarithmic (and not linear) in time.

CFS does not keep all process in this structure; rather, only running (or runnable) processes are kept therein. If a process goes to sleep, it is removed from the tree and kept track of elsewhere.

## Dealing With I/O And Sleeping Processes

CFS handles this case by altering the vruntime of a job when it wakes up. Specifically, CFS sets the vruntime of that job to the minimum value found in the tree (remember, the tree only contains running jobs)

In this way, CFS avoids starvation, but not without a cost: jobs that sleep for short periods of time frequently do not ever get their fair share of the CPU

---
title: CS372 Chapter 8 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: The Multi-Level Feedback Queue
---

# Table of content

- [Table of content](#table-of-content)
- [The Multi-Level Feedback Queue](#the-multi-level-feedback-queue)
- [MLFQ: Basic Rules](#mlfq-basic-rules)
- [Attempt 1: How To Change Priority](#attempt-1-how-to-change-priority)
  - [Example 1: A Single Long-Running Job](#example-1-a-single-long-running-job)
  - [Example 2: Along Came A Short Job](#example-2-along-came-a-short-job)
  - [Example 3: I/O](#example-3-io)
  - [Problems With Our Current MLFQ](#problems-with-our-current-mlfq)
    - [1. Starvation](#1-starvation)
    - [2. Game the Scheduler](#2-game-the-scheduler)
    - [3. Program Change Behavior](#3-program-change-behavior)
- [Attempt 2: Priority Boost](#attempt-2-priority-boost)
- [Attempt 3: Better Accounting](#attempt-3-better-accounting)
- [Tuning MLFQ And Other Issues](#tuning-mlfq-and-other-issues)
- [MLFQ: Summary](#mlfq-summary)

# The Multi-Level Feedback Queue

The fundamental problem MLFQ tries to address is two-fold.

1. Optimize turnaround time, previous chapter addressed that this is done by running shorter jobs first; unfortunately, the OS doesn’t generally know how long a job will run for, which is exactly the knowledge that algorithms like SJF (or STCF) require.

2. MLFQ would like to minimize response time; unfortunately, algorithms like Round Robin reduce response time but are terrible for turnaround time.

Thus, our problem:

- Given that we in general do not know anything about a process, how can we build a scheduler to achieve these goals?
- How can the scheduler learn, as the system runs, the characteristics of the jobs it is running, and thus make better scheduling decisions?

# MLFQ: Basic Rules

In our treatment, the MLFQ has a number of distinct queues, each assigned a different priority level.

- Rule 1: If Priority(A) > Priority(B), A runs (B doesn’t).
- Rule 2: If Priority(A) = Priority(B), A & B run in RR.

The key to MLFQ scheduling therefore lies in how the scheduler sets priorities. Rather than giving a fixed priority to each job, MLFQ varies the priority of a job based on its observed behavior

For example, a job repeatedly relinquishes the CPU while waiting for input from the keyboard, MLFQ will keep its priority high, as this is how an interactive process might behave. If, a job uses the CPU intensively for long periods of time, MLFQ will reduce its priority.

In this way, MLFQ will try to learn about processes as they run, and thus use the history of the job to predict its future behavior.

# Attempt 1: How To Change Priority

- Rule 3: When a job enters the system, it is placed at the highest priority (the topmost queue).
- Rule 4a: If a job uses up an entire time slice while running, its pri- ority is reduced (i.e., it moves down one queue).
- Rule 4b: If a job gives up the CPU before the time slice is up, it stays at the same priority level.

![figure 8.1](https://i.ibb.co/0MNrC18/8-1.png)

In the figure, two jobs (A and B) are at the highest priority level, while job C is in the middle and Job D is at the lowest priority. Given our current knowledge of how MLFQ works, the scheduler would just alternate time slices between A and B because they are the highest priority jobs in the system.

## Example 1: A Single Long-Running Job

![figure 8.2](https://i.ibb.co/p43cwVR/8-2.png)

The job enters at the highest priority (Q2). After a single time-slice of 10 ms, the scheduler reduces the job’s priority by one, and thus the job is on Q1. After running at Q1 for a time slice, the job is finally lowered to the lowest priority in the system (Q0), where it remains

## Example 2: Along Came A Short Job

![figure 8.3](https://i.ibb.co/v48Rsr4/8-3.png)

A (shown in black) is running along in the lowest-priority queue (as would any long-running CPU-intensive jobs); B (shown in gray) arrives at time T = 100, and thus is inserted into the highest queue; as its run-time is short (only 20 ms), B completes before reaching the bottom queue, in two time slices; then A resumes running (at low priority).

## Example 3: I/O

Rule 4b states above, if a process gives up the processor before using up its time slice, we keep it at the same priority level.

The intent of this rule is simple: if an interactive job, for example, is doing a lot of I/O (say by waiting for user input from the keyboard or mouse), it will relinquish the CPU before its time slice is complete; in such case, we don’t wish to penalize the job and thus simply keep it at the same level.

![figure 8.4](https://i.ibb.co/W0bLQJT/8-4.png)

The MLFQ approach keeps B at the highest priority because B keeps releasing the CPU; if B is an interactive job, MLFQ further achieves its goal of running interactive jobs quickly.

## Problems With Our Current MLFQ

### 1. Starvation

If there are “too many” interactive jobs in the system, they will combine to consume all CPU time, and thus long-running jobs will never receive any CPU time (they starve). We’d like to make some progress on these jobs even in this scenario.

### 2. Game the Scheduler

The algorithm we have described is susceptible to the following attack: before the time slice is over, issue an I/O operation (to some file you don’t care about) and thus relinquish the CPU; doing so allows you to remain in the same queue, and thus gain a higher percentage of CPU time.

When done right (e.g., by running for 99% of a time slice before relinquishing the CPU), a job could nearly monopolize the CPU.

### 3. Program Change Behavior

What was CPU-bound may transition to a phase of interactivity. With our current approach, such a job would be out of luck and not be treated like the other interactive jobs in the system.

# Attempt 2: Priority Boost

Rule 5: After some time period S, move all the jobs in the system to the topmost queue.

Our new rule solves two problems at once:

1. Processes are guaranteed not to starve: by sitting in the top queue, a job will share the CPU with other high-priority jobs in a round-robin fashion, and thus eventually receive service
2. If a CPU-bound job has become interactive, the scheduler treats it properly once it has received the priority boost

![figure 8.5](https://i.ibb.co/NVbfKBp/8-5.png)

On the left, there is no priority boost, and thus the long-running job gets starved once the two short jobs arrive; on the right, there is a priority boost every 50 ms (which is likely too small of a value, but used here for the example), and thus we at least guarantee that the long-running job will make some progress, getting boosted to the highest priority every 50 ms and thus getting to run periodically.

Of course, the addition of the time period S leads to the obvious ques- tion: what should S be set to? If it is set too high, long-running jobs could starve; too low, and interactive jobs may not get a proper share of the CPU.

# Attempt 3: Better Accounting

Rule 4: Once a job uses up its time allotment at a given level (regardless of how many times it has given up the CPU), its priority is reduced (i.e., it moves down one queue).

![]()

Figure 8.6 shows what happens when a workload tries to game the scheduler with the old Rules 4a and 4b (on the left) as well the new anti-gaming Rule 4. Without any protection from gaming, a process can issue an I/O just before a time slice ends and thus dominate CPU time. With such protections in place, regardless of the I/O behavior of the process, it slowly moves down the queues, and thus cannot gain an unfair share of the CPU.

# Tuning MLFQ And Other Issues

One big question is how to parameterize such a scheduler. For example, how many queues should there be? How big should the time slice be per queue? How often should priority be boosted in order to avoid starvation and account for changes in behavior?

There are no easy answers to these questions, and thus only some experience with workloads and subsequent tuning of the scheduler will lead to a satisfactory balance.

# MLFQ: Summary

The refined set of MLFQ rules, spread throughout the chapter, are reproduced here for your viewing pleasure:

- Rule 1: If Priority(A) > Priority(B), A runs (B doesn’t).
- Rule 2: If Priority(A) = Priority(B), A & B run in round-robin fashion using the time slice (quantum length) of the given queue.
- Rule 3: When a job enters the system, it is placed at the highest priority (the topmost queue).
- Rule 4: Once a job uses up its time allotment at a given level (regardless of how many times it has given up the CPU), its priority is reduced (i.e., it moves down one queue).
- Rule 5: After some time period S, move all the jobs in the system to the topmost queue.

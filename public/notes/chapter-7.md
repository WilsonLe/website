---
title: CS372 Chapter 7 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Scheduling
---

# Table of content

- [Table of content](#table-of-content)
- [Scheduling](#scheduling)
- [Workload Assumptions](#workload-assumptions)
- [Scheduling](#scheduling-1)
- [Workload Assumptions](#workload-assumptions-1)
- [Scheduling](#scheduling-2)
- [Workload Assumptions](#workload-assumptions-2)
- [Scheduling Metrics](#scheduling-metrics)
- [First In, First Out (FIFO)](#first-in-first-out-fifo)
- [Shortest Job First](#shortest-job-first)
- [Shortest Time-To-Completion First](#shortest-time-to-completion-first)
- [Response Time Metric](#response-time-metric)
- [Round Robin](#round-robin)
- [Incorporating I/O](#incorporating-io)
- [No More Oracle](#no-more-oracle)

# Scheduling

Questions:

- How should we develop a basic framework for thinking about scheduling policies?
- What are the key assumptions? What metrics are important? What basic approaches have been used in the earliest of computer systems?

# Workload Assumptions

We will make the following assumptions about the processes, sometimes called jobs, that are running in the system:

1. Each job runs for the same amount of time.
2. All jobs arrive at the same time.
3. Once started, each job runs to completion.
4. All jobs only use the CPU (i.e., they perform no I/O) 5. The run-time of each job is known.

# Scheduling

Questions:

- How should we develop a basic framework for thinking about scheduling policies?
- What are the key assumptions? What metrics are important? What basic approaches have been used in the earliest of com-
  puter systems?

# Workload Assumptions

We will make the following assumptions about the processes, sometimes called jobs, that are running in the system:

1. Each job runs for the same amount of time.
2. All jobs arrive at the same time.
3. Once started, each job runs to completion.
4. All jobs only use the CPU (i.e., they perform no I/O) 5. The run-time of each job is known.
   The workload assumptions here are mostly unrealistic, but it will be less so as we move further along, until these assumption became a fully operational scheduling discipline.

# Scheduling

Questions:

- How should we develop a basic framework for thinking about scheduling policies?
- What are the key assumptions? What metrics are important? What basic approaches have been used in the earliest of com-
  puter systems?

# Workload Assumptions

We will make the following assumptions about the processes, sometimes called jobs, that are running in the system:

1. Each job runs for the same amount of time.
2. All jobs arrive at the same time.
3. Once started, each job runs to completion.
4. All jobs only use the CPU (i.e., they perform no I/O) 5. The run-time of each job is known.

The workload assumptions here are mostly unrealistic, but it will be less so as we move further along, until these assumption became a fully operational scheduling discipline.

# Scheduling Metrics

A metric is just something that we use to measure something, and there are a number of different metrics that make sense in scheduling.

The **turnaround** time of a job is a performance metric. It is defined as the time at which the job completes minus the time at which the job arrived in the system.

Another metric of interest is fairness.

Performance and fairness are often at odds in scheduling; a scheduler, for example, may optimize performance but at the cost of preventing a few jobs from running, thus decreasing fairness.

# First In, First Out (FIFO)

The most basic algorithm we can implement is known as First In, First Out (FIFO) scheduling or sometimes First Come, First Served (FCFS).

Pros:

- Clearly simple and easy to implement
- Works well with the simple given assumption above

![figure 7.1](https://i.ibb.co/QNczPPC/7-1.png)

For example, given 3 jobs A, B, C. Each arrive roughly the same, with A coming first, followed by B and C. All jobs takes 10 milliseconds. Computing turnaround is as easy as (10 + 20 + 30) / 3 = 20 ms.

Now lets remove one of our assumptions: each job now no longer runs for the same amount of time.

![figure 7.2](https://i.ibb.co/jr1QqdY/7-2.png)

Given 3 jobs A, B, C. Each arrive roughly the same, with A coming first, followed by B and C. B and C both takes 10 milliseconds, while A takes 100 milliseconds. The average turnaround time now is (100 + 110 + 120) / 3 = 110.

The problem is referred to as the **convoy effect**, where a number of relatively short potential consumers of a resources get queued behind a heavy resource consumer.

# Shortest Job First

As the quite self-descriptive name suggests, the scheduler runs the shortest job first, then the next shortest, and so on.

![figure 7.3](https://i.ibb.co/TrKtsXC/7-3.png)

Given the 3 jobs similar to the second one described above, with the SJF policy, the schedule arrange jobs B, then C, finally A. This way, the average turnaround time is (10 + 20 + 120) / 3 = 50 - a much better performance than FIFO policy.

Given the assumption that all jobs arrive at the same time, we could prove that SJF is the optimal scheduling algorithm.

Now lets remove one more of our assumption: jobs now no longer arrive at the same time

![figure 7.4](https://i.ibb.co/k9d2KG0/7-4.png)

Again, given 3 the jobs earlier, but now B and C arrives after A 10 milliseconds. With SJF, A runs first, then B and C. The average turnaround time is (100 + (110 - 10) + (120 - 10)) / 3 = 103.33 seconds.

# Shortest Time-To-Completion First

Now lets remove another assumption: jobs now no longer guarantee runs to completion.

Any time a new job enters the system, the STCF scheduler determines which of the remaining jobs (including the new job) has the least time left, and schedules that one.

![figure 7.5](https://i.ibb.co/7RCSQVY/7-5.png)

Given the 3 jobs earlier, the STCF policy would run A first, then when B and C start, the policy preempt A and run B and C to completion, then continue next to A. With this policy, the average turnaround time is ((120 - 0) + (20 - 10) + (30 - 10)) / 3 = 50. With the assumption stated, we can prove that this policy is optimal.

# Response Time Metric

Normal users would sit at a terminal and demand interactive performance from the system as well. And thus, a new metric was born: response time. We define response time as the time from when the job arrives in a system to the first time it is scheduled.

All of the policies above are bad for response time. Take STCF for instance: if three jobs arrive at the same time, the third job has to wait for the previous two jobs to run in their entirety before being scheduled just once.

How to build a scheduler policy that is sensitive to response time?

# Round Robin

Instead of running jobs to completion, RR runs a job for a time slice (sometimes called a scheduling quantum) and then switches to the next job in the run queue. It repeatedly does so until the jobs are finished. For this reason, RR is sometimes called time-slicing. Note that the length of a time slice must be a multiple of the timer-interrupt period; thus if the timer interrupts every 10 milliseconds, the time slice could be 10, 20, or any other multiple of 10 ms.

![figure 7.6-7.7](https://i.ibb.co/G2MFzPw/7-6-7-7.png)

Assume three jobs A, B, and C arrive at the same time in the system, and that they each wish to run for 5 seconds. An SJF scheduler runs each job to completion before running another, while RR with a time-slice of 1 seconds would cycle through the jobs quickly.

The average response time of RR is (0 + 1 + 2) / 3 = 1, while for SJF, the average response time is (0 + 5 + 10) / 3 = 5.

The length of the time slice is critical for RR. The shorter it is, the better the performance of RR under the response-time metric. However, making the time slice too short is problematic: suddenly the cost of context switching will dominate overall performance. Thus, deciding on the length of the time slice presents a trade-off to a system designer, making it long enough to amortize the cost of switching without making it so long that the system is no longer responsive. The length of the slice generally should be a multiple of the time to interrupt the CPU.

More generally, any policy (such as RR) that is fair, i.e., that evenly divides the CPU among active processes on a small time scale, will perform poorly on metrics such as turnaround time. Indeed, this is an inherent trade-off: if you are willing to be unfair, you can run shorter jobs to completion, but at the cost of response time; if you instead value fairness, response time is lowered, but at the cost of turnaround time. This type of trade-off is common in systems; you can’t have your cake and eat it too.

# Incorporating I/O

Now we have one more assumption: there will be I/O. The scheduler clearly has a decision to make when a job initiates an I/O request, because the currently-running job won’t be using the CPU during the I/O; it is blocked waiting for I/O completion. If the I/O is sent to a hard disk drive, the process might be blocked for a few milliseconds or longer, depending on the current I/O load of the drive. Thus, the scheduler should probably schedule another job on the CPU at that time.

![figure 7.8-7.9](https://i.ibb.co/XsGn0WW/7-8-7-9.png)

The scheduler also has to make a decision when the I/O completes. When that occurs, an interrupt is raised, and the OS runs and moves the process that issued the I/O from blocked back to the ready state. Of course, it could even decide to run the job at that point.

By treating each CPU burst as a job, the scheduler makes sure processes that are “interactive” get run frequently. While those interactive jobs are performing I/O, other CPU-intensive jobs run, thus better utilizing the processor.

# No More Oracle

**In** the next chapter, we will solve the problem of removing the final assumption: now the scheduler no longer knows how long each process is going to take.

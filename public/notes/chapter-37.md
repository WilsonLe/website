---
title: CS372 Chapter 37 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Hard Disk
---

# Table of content

- [Table of content](#table-of-content)
- [The Interface](#the-interface)
- [Basic Geometry](#basic-geometry)
  - [Platter](#platter)
  - [Disk Arm and Head](#disk-arm-and-head)
- [A Simple Disk Drive](#a-simple-disk-drive)
  - [Single-track Latency: The Rotational Delay](#single-track-latency-the-rotational-delay)
  - [Multiple Tracks: Seek Time](#multiple-tracks-seek-time)
  - [Some Other Details](#some-other-details)
- [I/O Time: Doing The Math](#io-time-doing-the-math)
- [Disk Scheduling](#disk-scheduling)
  - [SSTF: Shortest Seek Time First](#sstf-shortest-seek-time-first)
  - [Elevator (a.k.a. SCAN or C-SCAN)](#elevator-aka-scan-or-c-scan)
  - [SPTF: Shortest Positioning Time First](#sptf-shortest-positioning-time-first)
- [Other Scheduling Issues](#other-scheduling-issues)

# The Interface

A disk with a single track can be understood as an array of memory. Accessing blocks of memory close to each other is faster than accessing memory further away from each other. Accessing blocks in a contiguous chunk is the fastest access mode, and much faster than any more random access pattern.

# Basic Geometry

## Platter

A circular hard surface on which data is stored persistently by inducing magnetic changes to it. A disk may have one or more platters; each platter has 2 sides, each of which is called a surface.

The platters are all bound together around the spindle, which is connected to a motor that spins the platters around (while the drive is powered on) at a constant (fixed) rate.

Data is encoded on each surface in concentric circles of sectors; we call one such concentric circle a track. A single surface contains many thousands and thousands of tracks, tightly packed together.

## Disk Arm and Head

To read and write to the platters' track, disk head and disk arm is use to sense (read) and induce (write) changes to the disks. The arm moves the head around the tracks.

# A Simple Disk Drive

## Single-track Latency: The Rotational Delay

The head waits for the disk to spin to the head to read a specific block. If the full rotation delay is R, and we start at half way accross the desired block, the rotation delay is R/2 for the desired block to be under the head. The worst case could be R, where the desired block is next to the current position, but since the disk is spinning counter clock-wise, it has to go a full circle.

## Multiple Tracks: Seek Time

We have been assuming a disk with single track, which is not realistic. With multiple tracks, the arm must move the head to a correct track (seek). Seek as many phases:

1. accelerate the disk arm to get it moving
2. coasting as the disk arm is moving at full speed
3. deceleration as the disk arm slows down
4. settings as the disk head is carefully positioned at the correct track

The settling time takes the longest. After settling is done, the disk spins to the correct block and transfer the data.

## Some Other Details

Some drive employ track skew to make sure that sequential reads can be properly serviced even when cross tracking boundaries.

Sectors are often skewed because when switching from one track to another, the disk needs time to reposition the head. Without such skew, the head would be moved to the next track but the desired next block would have already rotated under the head, and thus the drive would have to wait almost the entire rotational delay to access the next block.

Another reality is that outer tracks tend to have more sectors than inner tracks. Some tracks can have multiple zones congruent to each other on the same track, simply because the track has more space than the inner tracks.

Disks have its own caches to store recently read data. Write back policy means the disk acknowledge the write has complete when it has put the data in its memory. Write through policy means the disk acknowledge the write has complete after the write has actually been written to disk.

Write back might make disk appear to be faster, but if the file system (or applications) requires data to be written in a certain order, it can lead to problems.

# I/O Time: Doing The Math

T-I/O = T-seek + T-rotation + T-transfer

Rate of I/O = size transfer / T-I/O

# Disk Scheduling

The disk scheduler examine the requests and decides which I/O request to issue. Unlike job scheduling, we can make a good guess of how long the request will take by estimating the seek, posible rotation delay. Thus the scheduling can greedily choose Shortest Job First as its scheduling policy.

## SSTF: Shortest Seek Time First

The disk scheduling picks the requests on the nearest track to complete first.

The first problem with this approach is that the drive geometry is not available to the OS, but this can be fixed with a simple change to policy name (and behavior): Nearest Block First.

The second problem is starvation, where if a stream of requests on the same track comes in, the scheduling constantly pick those request to run, leaving requests to other further tracks starve.

## Elevator (a.k.a. SCAN or C-SCAN)

The policty simply moves back and forth the disk, servicing requests in order accross the tracks. Let’s call a single pass across the disk (from outer to inner tracks, or inner to outer) a sweep. If a request comes for a block on a track that has already been serviced on this sweep, the request will be pushed back into the queue, waiting for the next sweep.

C-SCAN is another common variant, short for Circular SCAN. Instead of sweeping both directions accross the disk, the algorithm sweep from outer to inner, then resets to the outer tracks. This result in more fairness than normal scan, because the middle tracks gets serviced twice before coming back to the outer tracks.

## SPTF: Shortest Positioning Time First

As the name suggests, the policy chooses whatever requests that has the shortest positioning time. The only problem is that if the scheduler is in the OS, it can produce inaccruate estimations because the OS does not have all the information of the disk (unlike a scheduler that runs internally in the disk).

# Other Scheduling Issues

In newer system, disks usually have their own scheduler, which allows the scheduler to implement SPTF more accurately.

Another important related task performed by disk schedulers is I/O merging. If multiple requests to read blocks that are next to each other, the scheduler could merge the requests, reducing number of requests that needs to be issued.

One final problem that modern schedulers address is this: how long should the system wait before issuing an I/O to disk? A work-conserving approach would be to issue the request to the drive as soon as an I/O comes up. A non-work-conserving approach would be to wait for sometime, hopefully a better request is issued, thus increase efficiency.

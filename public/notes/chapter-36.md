---
title: CS372 Chapter 36 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: I/O Devices
---

# Table of content

- [Table of content](#table-of-content)
- [System Architecture](#system-architecture)
- [A Canonical Device](#a-canonical-device)
- [A Canonical Protocol](#a-canonical-protocol)
- [Lowering CPU Overhead With Interrupts](#lowering-cpu-overhead-with-interrupts)
- [More Efficient Data Movement With DMA](#more-efficient-data-movement-with-dma)
- [Methods Of Device Interaction](#methods-of-device-interaction)
  - [Explicit I/O Instructions](#explicit-io-instructions)
  - [Memory Mapped I/O](#memory-mapped-io)
- [Fitting Into The OS: The Device Driver](#fitting-into-the-os-the-device-driver)

# System Architecture

![figure 36.1]()

The hierarchical structure is implemented because of physics and costs. The faster the bus, the shorter it must be, thus less device can plug into it. Engineer a fast bus is costly. Devices that requires high performance (i.e GPU) are nearer to the CPU then lower priority devices (i.e mice, keyboards).

The figure below is a live example of the Z270 chipset:

![figure 36.2]()

# A Canonical Device

![figure 36.3]()

The 2 important components is the hardware interface and its internal structure:

- Hardware interface and protocols allows software to interact with the device
- The internal structure does the implementation for all the abstraction the device presents to the computer system.

# A Canonical Protocol

Given the canonical device above, the hardware interface has a status (view the status of the device), command (for software to ask device to perform certain task), and data register (for software to pass data into the device or get data from device).

A typical interaction with the OS might have the following protocol:

```
While (STATUS == BUSY)
  ; // wait until device is not busy
Write data to DATA register
Write command to COMMAND register
    (starts the device and executes the command)
While (STATUS == BUSY)
    ; // wait until device is done with your request
```

# Lowering CPU Overhead With Interrupts

Instead of requesting I/O, then constantly asking if the request is complete and where's the data, the OS simply put the process to sleep, then context switch to another process. When the device has finish handling the I/O request, it raises a **hardware interupt**, the **interupt service handler** determines which process needs to wake up and wake up the process.

If a device is fast, we can still constantly polling for response because context switching and handling interupts are comparitively expensive.

If a device's response time is not known, a hybrid approach would be to constantly polling for response, and after a period of time has passed, use interupts (if it has not complete).

For network request that streams over packets of data, if the system is using interupt, then it will be stuck in a **livelock** where the system is constantly being interupted, literally.

Another optimization is called **coalescing**, where a device that needs to raise an interupt waits for a bit. While it waits, other device might complete, and merges the two could-have-been interupts into 1 (thus coalescing). The waiting time needs to be optimized for the trade-off too.

# More Efficient Data Movement With DMA

DMA is an engine that that does one specific job: maps addresses between device. This engine does not require a lot of CPU attention, thus could take the burden of mapping addresses and leave the CPU to do other epic jobs.

# Methods Of Device Interaction

## Explicit I/O Instructions

These instructions specify a way for OS the send data to specific devices' register, thus forming set of protocols. These instructions are OS priviledges only (meaning only the OS can run these instructions).

## Memory Mapped I/O

Hardware makes device registers virtually become memory addresses. To access a particular device register, the OS issue a read and write to the specific memory address, the hardware device then routes the read/write operation to the device (instead of the main memory).

# Fitting Into The OS: The Device Driver

To fit many devices into the OS, we uses **abstraction**, again. Device driver abstracts away the implementation, allowing OS and device(s) interact with each other.

---
title: CS372 Chapter 32 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Event-based Concurrency
---

# Table of content

- [Table of content](#table-of-content)
- [The Basic Idea: An Event Loop](#the-basic-idea-an-event-loop)
- [An Important API: select() (or poll())](#an-important-api-select-or-poll)
- [Using select()](#using-select)
- [Why Simpler? No Locks Needed](#why-simpler-no-locks-needed)
- [A Problem: Blocking System Calls](#a-problem-blocking-system-calls)
- [A Solution: Asynchronous I/O](#a-solution-asynchronous-io)
- [Another Problem: State Management](#another-problem-state-management)
- [What Is Still Difficult With Events](#what-is-still-difficult-with-events)

# The Basic Idea: An Event Loop

The approach: wait for an "event" to happen, then check what type of event it is, then do the work it requires. The pseudocode for an event loop looks like:

```c
while (1) {
  events = getEvents();
  for (e in events)
    processEvent(e);
}
```

The `processEvent()` routine is called the **event handler**.

# An Important API: select() (or poll())

These 2 interfaces allow a program to check if there's any incoming I/O that needs processing. In more detail: they give us a way to build a non-blocking event loop, which simply checks for incoming packets, reads from sockets with messages upon them, and replies as needed.

# Using select()

Consider the following code that uses the `select()` call:

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>
int main(void) {
  // open and set up a bunch of sockets (not shown)
  // main loop
  while (1) {
    // initialize the fd_set to all zero
    fd_set readFDs;
    FD_ZERO(&readFDs);
    // now set the bits for the descriptors
    // this server is interested in
    // (for simplicity, all of them from min to max)
    int fd;
    for (fd = minFD; fd < maxFD; fd++)
      FD_SET(fd, &readFDs);

    // do the select
    int rc = select(maxFD+1, &readFDs, NULL, NULL, NULL);
    // check which actually have data using FD_ISSET()
    int fd;
    for (fd = minFD; fd < maxFD; fd++)
      if (FD_ISSET(fd, &readFDs))
        processFD(fd);
```

Skipping over the initialization code, we jump straight into the main event loop.

The set of descriptors might represent all of the network sockets to which the server is handling.

# Why Simpler? No Locks Needed

Event-based application are decidedly single-threaded, allowing one event to be handled at a time. There is no need for locks, thus no common concurrency bugs.

# A Problem: Blocking System Calls

What if an event requires that you issue a system call that might block?

For instance, a http request comes, the server reads a file and send the data back. To handle that request, the server uses the `open()` and `read()` that issues I/O requests to the storage system. Since the server application is event-based, it is single-threaded, so the entire thread will go tangent to service that I/O request.

# A Solution: Asynchronous I/O

Async I/O enable an application to issue an I/O request and return control immediately to the caller, before the I/O has completed. Aditional interfaces enable an application to determine whether various I/Os have completed.

How to check if I/O is finished? If user program retains control after submit asynchronously I/O request, it should not be constantly asking the system if the request is handled.

Solution: unix signals will be sent through **interupts** to inform application that the I/O request is complete.

System without async I/O support cannot event-based approach.

# Another Problem: State Management

When an event handler issues an async I/O, it must keep tract of a state such that the next event handler could use when the I/O completes.

For instance, say we want to read data from a file descriptor, once the data is read, write the data to a network socket descriptor. The code for multi-threaded, sync I/O is simple: once the data is read, it stores the data on the stack, which is then used to write the data.

In event-based system, we need to record the necessary information to finish the event, such that when the async event finishes, we can lookup the necessary information, then process the event.

In the example above, it would be recording the awaited socket descriptor in a hash table. When the async I/O request completes, it looks up the hash table to find the neccessary information to handle the event of finishing-I/O-request.

# What Is Still Difficult With Events

When systems moved from a single CPU to multiple CPUs, the simplicity of the event-based approach no longer holds. Specifically, to utilize more than one CPU, the event server has to run multiple event handlers in parallel, thus the usually concurrency problems occur.

Another problem is that it does not integrate well with some system activities such as paging. If a page fault occurs with an event handler, the event handler will block the entire server.

Event-based code can be hard to manage over time, as the semantics of various routines change. If a routine change from blocking to non-blocking, the event handler has to change appropriately to address the routine change.

---
title: CS372 Chapter 32 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Concurrency Problems
---

# Table of content

- [Table of content](#table-of-content)
- [Concurrency problems](#concurrency-problems)
- [What Types Of Bugs Exist](#what-types-of-bugs-exist)
- [Non-Deadlock Bugs](#non-deadlock-bugs)
  - [Atomicity-Violation Bugs](#atomicity-violation-bugs)
  - [Order-Violation Bugs](#order-violation-bugs)
- [Deadlock Bugs](#deadlock-bugs)
  - [Why Do Deadlocks Occur?](#why-do-deadlocks-occur)
  - [Conditions for Deadlock](#conditions-for-deadlock)
  - [Circular Wait](#circular-wait)
  - [Hold-and-wait](#hold-and-wait)
  - [No Preemption](#no-preemption)
  - [Mutual Exclusion](#mutual-exclusion)
  - [Deadlock Avoidance via Scheduling](#deadlock-avoidance-via-scheduling)
  - [Detect and Recover](#detect-and-recover)

# Concurrency problems

In this chapter, we take a brief look at some example concurrency problems found in real code bases, to better understand what problems to look out for.

# What Types Of Bugs Exist

There are 2 types of bugs: deadlocks-related bugs, and non-deadlocks-related bugs.

# Non-Deadlock Bugs

## Atomicity-Violation Bugs

Situation: Thread 1 deference a pointer and checks if it's pointing to NULL, if not, print the value. Thread 2 just sets the pointer to point to NULL. If thread 1 finishes the check, then thread 2 runs, when thread 1 resumes, will attempt to dereference a NULL pointer int the print statement and throws an error.

Formal definition: The desired serializability among multiple memory accesses is violated (i.e. a code region is intended to be atomic, but the atomicity is not enforced during execution).

A fix to this problem: we simply add locks around the shared-variable references, ensuring that when either thread accesses the pointer, it has a lock held, ensuring atomic interaction with the shared variables.

## Order-Violation Bugs

Situation: Thread 1 initialize a variable, thread 2 uses that variable. Problem occurs when thread 2 runs before thread 1.

Formal definition: The desired order between two (groups of) memory accesses is flipped (i.e., A should always be executed before B, but the order is not enforced during execution)

A fix to this problem: enforce order. Condition variables is used to ensure this order. If the require order is to run thread 1 before thread 2, add a condition varible initailly to 0. In thread 1, if the operation is complete, set the condition variable to 1. In Thread 2, we wait while the condition variable is 0 - only executes when the condition variable is 1. This can also be achieved by semaphores.

# Deadlock Bugs

Deadlock is when a program **may** got into a state where all threads are waiting for each other, thus all threads are stuck.

## Why Do Deadlocks Occur?

One reason is that in large code bases, complex dependencies arise between components. The design of locking strategies in large systems must be carefully done to avoid deadlock in the case of circular dependencies that may occur naturally in the code.

Another reason is due to the nature of encapsulation. As software developers, we are taught to hide details of implementations and thus make software easier to build in a modular way. Unfortunately, such modularity does not mesh well with locking. For instance:

```c
Vector v1, v2;
v1.AddAll(v2);
```

To make `AddAll` implementation thread-safe, we need to lock v1 and v2. Refer to the dining philosopher problem: if thread 1 acquires v1, and thread 2 acquires v2, both of the thread is waiting for the other thread to release their v's, and thus both are stuck indefinitely.

## Conditions for Deadlock

Four conditions need to hold for a deadlock to occur:

1. Mutual exclusion: Threads claim exclusive control of resources that they require (e.g., a thread grabs a lock).
2. Hold-and-wait: Threads hold resource sallocated to them (e.g.,locks that they have already acquired) while waiting for additional resources (e.g., locks that they wish to acquire).
3. No preemption: Resources (e.g., locks) cannot be forcibly removed from threads that are holding them.
4. Circular wait: There exists a circular chain of threads such that each thread holds one or more resources (e.g., locks) that are being requested by the next thread in the chain.

To prevent a deadlock, all we need to do is to prevent any one of these condition to occur.

## Circular Wait

The most practical way to prevent is to write your code such that it does not introduce circular wait. The most straightforward way to do that is to provide a **total ordering** on lock acquisition.

Refer to the `v1` and `v2` example: rather than arbitrarily acquiring v1 and v2, we enforce v1 to be acquired before v2. Such strict ordering ensures that no cyclical wait arises; hence, no deadlock.

In complex system, **total ordering** might be uncessary while **partial ordering** is sufficient - enforce order on a subset of locks.

## Hold-and-wait

The hold-and-wait requirement for deadlock can be avoided by acquiring all locks at once, atomically - this means literally "locking the lock acquiring process".

While simple to understand, this solution has some problems:

1. Encapsulation works against us: when calling a routine, this approach requires us to know exactly which locks must be held and to acquire them ahead of time.
2. This technique also is likely to decrease concurrency as all locks must be acquired early on (at once) instead of when they are truly needed.

## No Preemption

Because we generally view locks as held until unlock is called, multiple lock acquisition often gets us into trouble because when waiting for one lock we are holding another.

Many thread libraries provide a more flexible set of interfaces to help avoid this situation. Specifically, the routine `pthread mutex trylock()` attempts to acquire the lock. If it successfully acquire the lock, good for it, it goes on holding the lock. If it fails (the lock is already held), too bad, try again later (in your code).

One new problem does arise, however: **livelock**. It is possible (though perhaps unlikely) that two threads could both be repeatedly attempting this sequence and repeatedly failing to acquire both locks.

There are solutions to the livelock problem, too: for example, one could add a random delay before looping back and trying the entire thing over again, thus significantly decreasing the odds of repeated interference among competing threads.

Encapsulation is also a problem: if a routine is holding multiple locks until it fails to hold the **trylock**, it has to release all other locks in a careful manner.

## Mutual Exclusion

Using powerful hardware instructions, you can build data structures in a manner that does not re- quire explicit locking.

For instance, refer to code below, which is an atomic routine provided by hardware:

```c
int compareAndSwap(int *address, int expected, int new){
    if (*address == expected){
        *address = new;
        return 1; // success
    }
    return 0; // failure
}
```

Imagine we now wanted to atomically increment a value by a certain amount, using compare-and-swap. We could do so with the following simple function:

```c
void AtomicIncrement(int *value, int amount) {
  do {
    int old = *value;
  } while (CompareAndSwap(value, old, old + amount) == 0);
}
```

Instead of acquiring a lock, doing the update, and then releasing it, we have instead built an approach that repeatedly tries to update the value to the new amount and uses the compare-and-swap to do so.

A more complex example: linked list insertion (insert before head). If we want to make list insertion thread-safe, we need to make the process of updating `newNode.next = head` and `head = newNode` atomic by acquiring and release lock inbetween those 2 operation. A possible approach using the `compareAndSwap`:

```c
void insert(int value) {
    node_t *n = malloc(sizeof(node_t)); assert(n != NULL);
    n->value = value;
    do{
        n->next = head;
    } while (CompareAndSwap(&head, n->next, n) == 0);
}
```

The code here updates the next pointer to point to the current head, and then tries to swap the newly-created node into position as the new head of the list. However, this will fail if some other thread successfully swapped in a new head in the meanwhile, causing this thread to retry again with the new head.

## Deadlock Avoidance via Scheduling

Instead of deadlock prevention, in some scenarios **deadlock avoidance** is preferable. Avoidance requires some global knowledge of which locks various threads might grab during their execution, and subsequently schedules said threads in a way as to guarantee no deadlock can occur.

Imagine 4 threads and 2 locks:

|     | T1  | T2  | T3  | T4  |
| --- | --- | --- | --- | --- |
| L1  | yes | yes | no  | no  |
| L2  | yes | yes | yes | no  |

A smart scheduler could thus compute that as long as T1 and T2 are not run at the same time, no deadlock could ever arise. Even if T1 and T3 or T2 and T3 runs concurrently, they can never cause deadlocks because T3 only acquires 1 lock.

Another example:

|     | T1  | T2  | T3  | T4  |
| --- | --- | --- | --- | --- |
| L1  | yes | yes | yes | no  |
| L2  | yes | yes | yes | no  |

Because T1, T2, and T3 all grabs 2 locks, it is possible that the scheduler will make them run sequentially, while T4 runs concurrently along side - this way deadlock cannot occur.

## Detect and Recover

One final general strategy is to allow deadlocks to occasionally occur, and then take some action once such a deadlock has been detected.

For example, if an OS froze once a year, you would just reboot it and get happily (or grumpily) on with your work. If deadlocks are rare, such a non-solution is indeed quite pragmatic.

Many database systems employ deadlock detection and recovery techniques. A deadlock detector runs periodically, building a resource graph and checking it for cycles. In the event of a cycle (deadlock), the system needs to be restarted. If more intricate repair of data structures is first required, a human being may be involved to ease the process.

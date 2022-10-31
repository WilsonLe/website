---
title: CS372 Chapter 31 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Semaphores
---

# Table of content

- [Table of content](#table-of-content)
- [Semaphores](#semaphores)
- [Definition](#definition)
- [Binary Semaphores (Locks)](#binary-semaphores-locks)
- [Semaphores For Ordering](#semaphores-for-ordering)
- [The Producer/Consumer (Bounded Buffer) Problem](#the-producerconsumer-bounded-buffer-problem)
  - [First Attempt](#first-attempt)
  - [A Solution: Adding Mutual Exclusion](#a-solution-adding-mutual-exclusion)
  - [Avoiding Deadlock](#avoiding-deadlock)
  - [At Last, A Working Solution](#at-last-a-working-solution)
- [Reader-Writer Locks](#reader-writer-locks)
- [The Dining Philosophers](#the-dining-philosophers)
  - [Broken Solution](#broken-solution)
  - [A Solution: Breaking The Dependency](#a-solution-breaking-the-dependency)
- [Thread Throttling](#thread-throttling)
- [How To Implement Semaphores](#how-to-implement-semaphores)

# Semaphores

Dijkstra and colleagues invented the semaphore as a single primitive for all things related to synchronization; as you will see, one can use semaphores as both locks and condition variables.

# Definition

A semaphore is an object with an integer value that we can manipulate with two routines; in the POSIX standard, these routines are `sem wait()` and `sem post()` . Because the initial value of the semaphore determines its behavior, before calling any other routine to interact with the semaphore, we must first initialize it to some value, as the code below:

```c
#include <semaphore.h>
sem_t s;
sem_init(&s, 0, 1);
```

In the figure, we declare a semaphore s and initialize it to the value 1 by passing 1 in as the third argument. The second argument to sem init() will be set to 0 in all of the examples we’ll see; this indicates that the semaphore is shared between threads in the same process.

After a semaphore is initialized, we can call one of two functions to interact with it, `sem wait()` or `sem post()`. The behavior of these two functions is seen in the code below:

```c
int sem_wait(sem_t *s) {
    // decrement the value of semaphore s by one
    // wait if value of semaphore s is negative
}

int sem_post(sem_t *s) {
    // increment the value of semaphore s by one
    // if there are one or more threads waiting, wake one
}
```

For now, we are not concerned with the implementation of these routines, which clearly requires some care; with multiple threads calling into `sem wait()` and `sem post()`, there is the obvious need for managing these critical sections.

We should discuss a few salient aspects of the interfaces here.

First, we can see that `sem wait()` will either return right away (because the value of the semaphore was one or higher when we called `sem wait()`), or it will cause the caller to suspend execution waiting for a subsequent post. Of course, multiple calling threads may call into `sem wait()`, and thus all be queued waiting to be woken.

Second, we can see that `sem post()` does not wait for some particular condition to hold like `sem wait()` does. Rather, it simply increments the value of the semaphore and then, if there is a thread waiting to be woken, wakes one of them up.

Third, the value of the semaphore, when negative, is equal to the number of waiting threads. Though the value generally isn’t seen by users of the semaphores, this invariant is worth knowing and perhaps can help you remember how a semaphore functions.

# Binary Semaphores (Locks)

Our first use will be one with which we are already familiar: using a semaphore as a lock. we simply surround the critical section of interest with a `sem wait()`/`sem post()` pair. Critical to making this work, though, is the initial value of the semaphore should be 1.

```c
sem_t m;
sem_init(&m, 0, 1);

sem_wait(&m);
// critical section here
sem_post(&m);
```

# Semaphores For Ordering

Semaphores are also useful to order events in a concurrent program. For example, a thread may wish to wait for a list to become non-empty, so it can delete an element from it. In this pattern of usage, we often find one thread waiting for something to happen, and another thread making that something happen and then signaling that it has happened, thus waking the waiting thread. We are thus using the semaphore as an ordering primitive (similar to our use of condition variables earlier).

A simple example is as follows. Imagine a thread creates another thread and then wants to wait for it to complete its execution.

The question, then, is how to use a semaphore to achieve this effect; as it turns out, the answer is relatively easy to understand. As you can see in the code, the parent simply calls `sem wait()` and the child `sem post()` to wait for the condition of the child finishing its execution to become true. The initial value should be set to 0: consider the following 2 cases:

First, let us assume that the parent creates the child but the child has not run yet. In this case the parent will call `sem wait()` before the child has called `sem post()`; we’d like the parent to wait for the child to run. The only way this will happen is if the value of the semaphore is not greater than 0; hence, 0 is the initial value. The parent runs, decrements the semaphore (to -1), then waits (sleeping). When the child finally runs, it will call `sem post()`, increment the value of the semaphore to 0, and wake the parent, which will then return from `sem wait()` and finish the program.

The second case the child will first call `sem post()`, thus incrementing the value of the semaphore from 0 to 1. When the parent then gets a chance to run, it will call `sem wait()` and find the value of the semaphore to be 1; the parent will thus decrement the value (to 0) and return from `sem wait()` without waiting, also achieving the desired effect.

# The Producer/Consumer (Bounded Buffer) Problem

## First Attempt

Our first attempt at solving the problem introduces two semaphores, empty and full, which the threads will use to indicate when a buffer entry has been emptied or filled, respectively. The code for the put and get routines is below:

```c
int buffer[MAX];
int fill = 0;
intuse=0;

void put(int value) {
    buffer[fill] = value; // Line F1
    fill=(fill+1)%MAX;  // Line F2
}

int get() {
    int tmp = buffer[use]; // Line G1
    use=(use+1)%MAX; // Line G2
    return tmp;
}
```

The attempt at solving the producer and consumer problem is below:

```c
sem_t empty;
sem_t full;
void *producer(void *arg) {
    int i;
    for (i = 0; i < loops; i++){
        sem_wait(&empty); // Line P1
        put(i); // Line P2
        sem_post(&full); // Line P3
    }
}

void *consumer(void *arg) {
    int i,tmp=0;
    while (tmp != -1) {
        sem_wait(&full); // Line C1
        tmp = get(); // Line C2
        sem_post(&empty); // Line C3
        printf("%d\n", tmp);
    }
}

int main(int argc, char *argv[]) {
    // ...
    sem_init(&empty, 0, MAX); // MAX are empty
    sem_init(&full, 0, 0); // 0 are full
    // ...
}
```

In this example, the producer first waits for a buffer to become empty in order to put data into it, and the consumer similarly waits for a buffer to become filled before using it.

Imagine again there are two threads, a producer and a consumer. Let us examine a specific scenario on a single CPU. Assume the consumer gets to run first. Thus, the consumer will hit Line C1 in calling `sem wait(&full)`. Because full was initialized to the value 0, the call will decrement full (to -1), block the consumer, and wait for another thread to call `sem post()` on full, as desired.

Assume the producer then runs. It will hit Line P1, thus calling the `sem wait(&empty)` routine. Unlike the consumer, the producer will continue through this line, because empty was initialized to the value MAX (in this case, 1). Thus, empty will be decremented to 0 and the producer will put a data value into the first entry of buffer (Line P2). The producer will then continue on to P3 and call sem post(&full), changing the value of the full semaphore from -1 to 0 and waking the consumer (e.g., move it from blocked to ready).

In this case, one of two things could happen. If the producer continues to run, it will loop around and hit Line P1 again. This time, however, it would block, as the empty semaphore’s value is 0. If the producer instead was interrupted and the consumer began to run, it would return from `sem wait(&full)` (Line C1), find that the buffer was full, and consume it. In either case, we achieve the desired behavior.

Let us now imagine that MAX is greater than 1 (say MAX=10). For this example, let us assume that there are multiple producers and multiple consumers. We now have a problem: a race condition.

Imagine two producers (Pa and Pb) both calling into put() at roughly the same time. Assume producer Pa gets to run first, and just starts to fill the first buffer entry (fill=0 at Line F1). Before Pa gets a chance to increment the fill counter to 1, it is interrupted. Producer Pb starts to run, and at Line F1 it also puts its data into the 0th element of buffer, which means that the old data there is overwritten! This action is a no-no; we don’t want any data from the producer to be lost.

## A Solution: Adding Mutual Exclusion

As you can see, what we’ve forgotten here is mutual exclusion. The fill- ing of a buffer and incrementing of the index into the buffer is a critical section, and thus must be guarded carefully. So let’s use our friend the binary semaphore and add some locks.

```c
void *producer(void *arg) {
    int i;
    for (i = 0; i < loops; i++){
        sem_wait(&mutex); // Line P0
        sem_wait(&empty); // Line P1
        put(i); // Line P2
        sem_post(&full); // Line P3
        sem_post(&mutex); // Line P4
    }
}

void *consumer(void *arg) {
    int i,tmp=0;
    while (tmp != -1) {
        sem_wait(&mutex); // Line C0
        sem_wait(&full); // Line C1
        tmp = get(); // Line C2
        sem_post(&empty); // Line C3
        sem_post(&mutex); // Line C4
        printf("%d\n", tmp);
    }
}
```

## Avoiding Deadlock

Imagine two threads, one producer and one consumer. The consumer gets to run first. It acquires the mutex (Line C0), and then calls `sem wait()` on the full semaphore (Line C1); because there is no data yet, this call causes the consumer to block and thus yield the CPU; importantly, though, the consumer still holds the lock.

A producer then runs. It has data to produce and if it were able to run, it would be able to wake the consumer thread and all would be good. Unfortunately, the first thing it does is call `sem wait()` on the binary mutex semaphore (Line P0). The lock is already held. Hence, the producer is now stuck waiting too.

There is a simple cycle here. The consumer holds the mutex and is waiting for the someone to signal full. The producer could signal full but is waiting for the mutex. Thus, the producer and consumer are each stuck waiting for each other: a classic deadlock.

## At Last, A Working Solution

To solve this problem, we simply must reduce the scope of the lock.

```c
void *producer(void *arg) {
    int i;
    for (i = 0; i < loops; i++){
        sem_wait(&empty); // Line P1
        sem_wait(&mutex); // Line P1.5 - mutex here
        put(i); // Line P2
        sem_post(&mutex); // Line P2.5 - and here
        sem_post(&full); // Line P3
    }
}

void *consumer(void *arg) {
    int i,tmp=0;
    while (tmp != -1) {
        sem_wait(&full); // Line C1
        sem_wait(&mutex); // Line C1.5 - mutex here
        tmp = get(); // Line C2
        sem_post(&mutex); // Line C2.5 - and here
        sem_post(&empty); // Line C3
        printf("%d\n", tmp);
    }
}
```

The result is a simple and working bounded buffer, a commonly-used pattern in multi-threaded programs.

# Reader-Writer Locks

Another classic problem stems from the desire for a more flexible locking primitive that admits that different data structure accesses might require different kinds of locking. For example, imagine a number of concurrent list operations, including inserts and simple lookups. While inserts change the state of the list (and thus a traditional critical section makes sense), lookups simply read the data structure; as long as we can guarantee that no insert is on-going, we can allow many lookups to proceed concurrently. The special type of lock we will now develop to support this type of operation is known as a reader-writer lock.

```c
typedef struct _rwlock_t {
  sem_t lock;      // binary semaphore (basic lock)
  sem_t writelock; // allow ONE writer/MANY readers
  int   readers;   // #readers in critical section
} rwlock_t;

void rwlock_init(rwlock_t *rw) {
  rw->readers = 0;
  sem_init(&rw->lock, 0, 1);
  sem_init(&rw->writelock, 0, 1);
}

void rwlock_acquire_readlock(rwlock_t *rw) {
  sem_wait(&rw->lock);
  rw->readers++;
  if (rw->readers == 1) // first reader gets writelock
    sem_wait(&rw->writelock);
  sem_post(&rw->lock);
}

void rwlock_release_readlock(rwlock_t *rw) {
  sem_wait(&rw->lock);
  rw->readers--;
  if (rw->readers == 0) // last reader lets it go
    sem_post(&rw->writelock);
  sem_post(&rw->lock);
}

void rwlock_acquire_writelock(rwlock_t *rw) {
  sem_wait(&rw->writelock);
}

void rwlock_release_writelock(rwlock_t *rw) {
  sem_post(&rw->writelock);
}
```

The code is pretty simple. If some thread wants to update the data structure in question, it should call the new pair of synchronization operations: `rwlock_acquire_writelock()`, to acquire a write lock, and `rwlock_release_writelock()`, to release it. Internally, these simply use the `writelock` semaphore to ensure that only a single writer can acquire the lock and thus enter the critical section to update the data structure in question.

More interesting is the pair of routines to acquire and release read locks. When acquiring a read lock, the reader first acquires lock and then increments the readers variable to track how many readers are currently inside the data structure. The important step then taken within `rwlock_acquire_readlock()` occurs when the first reader acquires the lock; in that case, the reader also acquires the write lock by calling `sem wait()` on the writelock semaphore, and then releasing the lock by calling `sem post()`.

Thus, once a reader has acquired a read lock, more readers will be allowed to acquire the read lock too; however, any thread that wishes to acquire the write lock will have to wait until all readers are finished; the last one to exit the critical section calls `sem post()` on `writelock` and thus enables a waiting writer to acquire the lock.

This approach works (as desired), but does have some negatives, especially when it comes to fairness. In particular, it would be relatively easy for readers to starve writers.

Finally, it should be noted that reader-writer locks should be used with some caution. They often add more overhead (especially with more sophisticated implementations), and thus do not end up speeding up performance as compared to just using simple and fast locking primitives. Either way, they showcase once again how we can use semaphores in an interesting and useful way.

# The Dining Philosophers

The basic setup for the problem is this: assume there are five “philosophers” sitting around a table. Between each pair of philosophers is a single fork (and thus, five total). The philoso phers each have times where they think, and don’t need any forks, and times where they eat. In order to eat, a philosopher needs two forks, both the one on their left and the one on their right. The contention for these forks, and the synchronization problems that ensue, are what makes this a problem we study in concurrent programming.

![figure 31.14](https://i.ibb.co/fqFgbpb/31-14.png)

Here is the basic loop of each philosopher, assuming each has a unique thread identifier p from 0 to 4 (inclusive):

```c
while (1) {
    think();
    get_forks(p);
    eat();
    put_forks(p);
}
```

The key challenge, then, is to write the routines `get forks()` and `put forks()` such that there is no deadlock, no philosopher starves and never gets to eat, and concurrency is high (i.e., as many philosophers can eat at the same time as possible).

Following Downey’s solutions, we’ll use a few helper functions to get us towards a solution. They are:

```c
int left(int p)  { return p; }
int right(int p) { return (p + 1) % 5; }
```

When philosopher p wishes to refer to the fork on their left, they simply call `left(p)`. Similarly, the fork on the right of a philosopher p is referred to by calling `right(p)`; the modulo operator therein handles the one case where the last philosopher (p=4) tries to grab the fork on their right, which is fork 0.

We’ll also need some semaphores to solve this problem. Let us assume we have five, one for each fork: `sem t forks[5]`.

## Broken Solution

Assume we initialize each semaphore (in the forks array) to a value of 1. Assume also that each philosopher knows its own number (p). We can thus write the `get forks()` and `put forks()` routine.

```c
void get_forks(int p) {
    sem_wait(&forks[left(p)]);
    sem_wait(&forks[right(p)]);
}
void put_forks(int p) {
    sem_post(&forks[left(p)]);
    sem_post(&forks[right(p)]);
}
```

The intuition behind this (broken) solution is as follows. To acquire the forks, we simply grab a “lock” on each one: first the one on the left, and then the one on the right. When we are done eating, we release them. Simple, no? Unfortunately, in this case, simple means broken.

The problem is deadlock. If each philosopher happens to grab the fork on their left before any philosopher can grab the fork on their right, each will be stuck holding one fork and waiting for another, forever.

## A Solution: Breaking The Dependency

The simplest way to attack this problem is to change how forks are acquired by at least one of the philosophers; indeed, this is how Dijkstra himself solved the problem. Specifically, let’s assume that philosopher 4 (the highest numbered one) gets the forks in a different order than the others; the `put forks()` code remains the same.

```c
void get_forks(int p) {
    if (p == 4) {
        sem_wait(&forks[right(p)]);
        sem_wait(&forks[left(p)]);
    } else {
        sem_wait(&forks[left(p)]);
        sem_wait(&forks[right(p)]);
    }
}
```

Because the last philosopher tries to grab right before left, there is no situation where each philosopher grabs one fork and is stuck waiting for another; the cycle of waiting is broken.

# Thread Throttling

One other simple use case for semaphores arises on occasion, and thus we present it here. The specific problem is this: how can a programmer prevent “too many” threads from doing something at once and bogging the system down? Answer: decide upon a threshold for “too many”, and then use a semaphore to limit the number of threads concurrently executing the piece of code in question. We call this approach throttling, and consider it a form of admission control.

Imagine that you create hundreds of threads to work on some problem in parallel. However, in a certain part of the code, each thread acquires a large amount of memory to perform part of the computation; let’s call this part of the code the memory-intensive region. If all of the threads enter the memory-intensive region at the same time, the sum of all the memory allocation requests will exceed the amount of physical memory on the machine. As a result, the machine will start thrashing (i.e., swapping pages to and from the disk), and the entire computation will slow to a crawl.

A simple semaphore can solve this problem. By initializing the value of the semaphore to the maximum number of threads you wish to enter the memory-intensive region at once, and then putting a `sem wait()` and `sem post()` around the region, a semaphore can naturally throttle the number of threads that are ever concurrently in the dangerous region of the code.

# How To Implement Semaphores

Let’s use our low-level synchronization primitives, locks and condition variables, to build our own version of semaphores.

```c
typedef struct __Zem_t {
    int value;
    pthread_cond_t cond;
    pthread_mutex_t lock;
} Zem_t;

// only one thread can call this
void Zem_init(Zem_t *s, int value){
    s->value = value;
    Cond_init(&s->cond);
    Mutex_init(&s->lock);
}

void Zem_wait(Zem_t *s) {
    Mutex_lock(&s->lock);
    while (s->value <= 0)
        Cond_wait(&s->cond, &s->lock);
    s->value--;
    Mutex_unlock(&s->lock);
}

void Zem_post(Zem_t *s) {
    Mutex_lock(&s->lock);
    s->value++;
    Cond_signal(&s->cond);
    Mutex_unlock(&s->lock);
}
```

In the code above, we use just one lock and one condition variable, plus a state variable to track the value of the semaphore.

One subtle difference between our and pure semaphores as defined by Dijkstra is that we don’t maintain the invariant that the value of the semaphore, when negative, reflects the number of waiting threads; indeed, the value will never be lower than zero. This behavior is easier to implement and matches the current Linux implementation.

Curiously, building condition variables out of semaphores is a much trickier proposition. Some highly experienced concurrent programmers tried to do this in the Windows environment, and many different bugs ensued.

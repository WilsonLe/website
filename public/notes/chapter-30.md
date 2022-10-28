---
title: CS372 Chapter 30 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Condition Variables
---

# Table of content

- [Table of content](#table-of-content)
- [Definition and Routines](#definition-and-routines)
- [The Producer/Consumer (Bounded Buffer) Problem](#the-producerconsumer-bounded-buffer-problem)
  - [A Broken Solution](#a-broken-solution)
- [Better, But Still Broken: While, Not If](#better-but-still-broken-while-not-if)
  - [The Single Buffer Producer/Consumer Solution](#the-single-buffer-producerconsumer-solution)
- [Covering Conditions](#covering-conditions)

# Definition and Routines

To wait for a condition to become true, a thread can make use of what is known as a condition variable. A condition variable is an explicit queue that threads can put themselves on when some state of execution (i.e., some condition) is not as desired (by waiting on the condition); some other thread, when it changes said state, can then wake one (or more) of those waiting threads and thus allow them to continue (by signaling on the condition).

To declare such a condition variable, one simply writes something like this: pthread cond t c;, which declares c as a condition variable (note: proper initialization is also required). A condition variable has two operations associated with it: wait() and signal(). The wait() call is executed when a thread wishes to put itself to sleep; the signal() call is executed when a thread has changed something in the program and thus wants to wake a sleeping thread waiting on this condition. Specifi- cally, the POSIX calls look like this:

```
pthread_cond_wait(pthread_cond_t *c, pthread_mutex_t *m);
pthread_cond_signal(pthread_cond_t *c);
```

We will often refer to these as wait() and signal() for simplicity.

One thing you might notice about the wait() call is that it also takes a mutex as a parameter; it assumes that this mutex is locked when wait() is called. The responsibility of wait() is to release the lock and put the calling thread to sleep (atomically); when the thread wakes up (after some other thread has signaled it), it must re-acquire the lock before returning to the caller.

This complexity stems from the desire to prevent certain race conditions from occurring when a thread is trying to put itself to sleep.

```c
int done  = 0;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t c  = PTHREAD_COND_INITIALIZER;

void thr_exit() {
    Pthread_mutex_lock(&m);
    done = 1;
    Pthread_cond_signal(&c);
    Pthread_mutex_unlock(&m);
}
void *child(void *arg) {
    printf("child\n");
    thr_exit();
    return NULL;
}
void thr_join() {
    // this lock ensure unfortunate timing interupt happens when we checked while done == 0, then context switch to child threads, the child threads finish within one quantum time, sends the signal to parent even when the parent has not called "wait" yet.
    Pthread_mutex_lock(&m);
    while (done == 0)
        Pthread_cond_wait(&c, &m);
    Pthread_mutex_unlock(&m);
}

int main(int argc, char *argv[]) {
    printf("parent: begin\n");
    pthread_t p;
    Pthread_create(&p, NULL, child, NULL);
    thr_join();
    printf("parent: end\n");
    return 0;
}
```

Another alternative implementation:

```c
void thr_exit() {
    Pthread_mutex_lock(&m);
    Pthread_cond_signal(&c);
    Pthread_mutex_unlock(&m);
}

void thr_join() {
    Pthread_mutex_lock(&m);
    Pthread_cond_wait(&c, &m);
    Pthread_mutex_unlock(&m);
}
```

Unfortunately this approach is broken. Imagine the case where the child runs immediately and calls thr exit() immediately; in this case, the child will signal, but there is no thread asleep on the condition. When the parent runs, it will simply call wait and be stuck; no thread will ever wake it.

Another poor implementation:

```c
void thr_exit() {
    done = 1;
    Pthread_cond_signal(&c);
}

void thr_join() {
    if (done == 0)
        Pthread_cond_wait(&c);
}
```

The issue here is a subtle race condition. Specifically, if the parent calls thr join() and then checks the value of done, it will see that it is 0 and thus try to go to sleep. But just before it calls wait to go to sleep, the parent is interrupted, and the child runs. The child changes the state variable done to 1 and signals, but no thread is waiting and thus no thread is woken. When the parent runs again, it sleeps forever.

# The Producer/Consumer (Bounded Buffer) Problem

Imagine one or more producer threads and one or more consumer threads. Producers generate data items and place them in a buffer; con- sumers grab said items from the buffer and consume them in some way.

This arrangement occurs in many real systems. For example, in a multi-threaded web server, a producer puts HTTP requests into a work queue (i.e., the bounded buffer); consumer threads take requests out of this queue and process them.

A bounded buffer is also used when you pipe the output of one pro- gram into another, e.g., grep foo file.txt | wc -l. This example runs two processes concurrently; grep writes lines from file.txt with the string foo in them to what it thinks is standard output; the UNIX shell redirects the output to what is called a UNIX pipe (created by the pipe system call). The other end of this pipe is connected to the stan- dard input of the process wc, which simply counts the number of lines in the input stream and prints out the result. Thus, the grep process is the producer; the wc process is the consumer; between them is an in-kernel bounded buffer; you, in this example, are just the happy user.

Because the bounded buffer is a shared resource, we must of course require synchronized access to it.

The first thing we need is a shared buffer, into which a producer puts data, and out of which a consumer takes data. Let’s just use a single integer for simplicity (you can certainly imagine placing a pointer to a data structure into this slot instead), and the two inner routines to put a value into the shared buffer, and to get a value out of the buffer.

```c
void *producer(void *arg) {
    int i;
    int loops = (int) arg;
    for (i = 0; i < loops; i++) {
        put(i);
    }
}

void *consumer(void *arg) {
    while (1) {
        int tmp = get();
        printf("%d\n", tmp);
    }
}
```

The put() routine assumes the buffer is empty, and then simply puts a value into the shared buffer and marks it full by setting count to 1. The get() routine does the opposite, setting the buffer to empty and returning the value.

Now we need to write some routines that know when it is OK to access the buffer to either put data into it or get data out of it. The conditions for this should be obvious: only put data into the buffer when count is zero (i.e., when the buffer is empty), and only get data from the buffer when count is one (i.e., when the buffer is full). If we write the synchronization code such that a producer puts data into a full buffer, or a consumer gets data from an empty one, we have done something wrong (and in this code, an assertion will fire).

This work is going to be done by two types of threads, one set of which we’ll call the producer threads, and the other set which we’ll call con- sumer threads.

The code above shows a producer that puts an integer into the shared buffer loops number of times, and a consumer that gets the data out of that shared buffer (forever), each time printing out the data item it pulled from the shared buffer.

## A Broken Solution

Now imagine that we have just a single producer and a single consumer. Obviously the put() and get() routines have critical sections within them, as put() updates the buffer, and get() reads from it.

Not surprisingly, that something more is some condition variables. In this (broken) first try, we have a single condition variable cond and associated lock mutex.

```c
int loops; // must initialize somewhere...
cond_t  cond;
mutex_t mutex;

void *producer(void *arg) {
    int i;
    for (i = 0; i < loops; i++){
        Pthread_mutex_lock(&mutex);
        if (count == 1)
            Pthread_cond_wait(&cond, &mutex);
        put(i);
        Pthread_cond_signal(&cond)
        Pthread_mutex_unlock(&mutex);
    }
}

void *consumer(void *arg) {
    int i;
    for (i = 0; i < loops; i++) {
        Pthread_mutex_lock(&mutex);
        if (count == 0)
            Pthread_cond_wait(&cond, &mutex);
        int tmp = get();
        Pthread_cond_signal(&cond);
        Pthread_mutex_unlock(&mutex);
        printf("%d\n", tmp);
    }
}
```

With just a single producer and a single consumer, the code in above works. However, if we have more than one of these threads (e.g., two consumers), the solution has two critical problems.

Then the producer (Tp) runs. It acquires the lock (p1), checks if all buffers are full (p2), and finding that not to be the case, goes ahead and fills the buffer (p4). The producer then signals that a buffer has been filled (p5). Critically, this moves the first consumer (Tc1) from sleeping on a condition variable to the ready queue; Tc1 is now able to run (but not yet running). The producer then continues until realizing the buffer is full, at which point it sleeps (p6, p1–p3).

![figure 30.9](https://i.ibb.co/4KZ1C28/30-9.png)

Here is where the problem occurs: another consumer (Tc2) sneaks in and consumes the one existing value in the buffer (c1, c2, c4, c5, c6, skip- ping the wait at c3 because the buffer is full). Now assume Tc1 runs; just before returning from the wait, it re-acquires the lock and then returns. It then calls get() (c4), but there are no buffers to consume! An assertion triggers, and the code has not functioned as desired. Clearly, we should have somehow prevented Tc1 from trying to consume because Tc2 snuck in and consumed the one value in the buffer that had been produced.

The problem arises for a simple reason: after the producer woke Tc1, but before Tc1 ever ran, the state of the bounded buffer changed (thanks to Tc2). Signaling a thread only wakes them up; it is thus a hint that the state of the world has changed (in this case, that a value has been placed in the buffer), but there is no guarantee that when the woken thread runs, the state will still be as desired.

This interpretation of what a signal means is often referred to as Mesa semantics. The contrast, referred to as Hoare semantics, is harder to build but provides a stronger guarantee that the woken thread will run immediately upon being woken.

# Better, But Still Broken: While, Not If

Fortunately, this fix is easy: change the if to a while.

hanks to Mesa semantics, a simple rule to remember with condition variables is to always use while loops. Sometimes you don’t have to re- check the condition, but it is always safe to do so.

The problem oc- curs when two consumers run first (Tc1 and Tc2) and both go to sleep (c3). Then, the producer runs, puts a value in the buffer, and wakes one of the consumers (say Tc1). The producer then loops back (releasing and reac- quiring the lock along the way) and tries to put more data in the buffer; because the buffer is full, the producer instead waits on the condition (thus sleeping). Now, one consumer is ready to run (Tc1), and two threads are sleeping on a condition (Tc2 and Tp).

The consumer Tc1 then wakes by returning from wait() (c3), re-checks the condition (c2), and finding the buffer full, consumes the value (c4). This consumer then, critically, signals on the condition (c5), waking only one thread that is sleeping.

Because the consumer has emptied the buffer, it clearly should wake the producer. However, if it wakes the consumer Tc2 (which is definitely possible, depending on how the wait queue is managed), we have a prob- lem. Specifically, the consumer Tc2 will wake up and find the buffer empty (c2), and go back to sleep (c3). The producer Tp, which has a value to put into the buffer, is left sleeping. The other consumer thread, Tc1, also goes back to sleep. All three threads are left sleeping, a clear bug. Follow the figure below for a trace:

![figure 30.11](https://i.ibb.co/Dk3D8T9/30-11.png)

## The Single Buffer Producer/Consumer Solution

# Covering Conditions

When a thread calls into the memory allocation code, it might have to wait in order for more memory to be- come free. Conversely, when a thread frees memory, it signals that more memory is free. However, our code above has a problem: which waiting thread (there can be more than one) should be woken up.

Consider the following scenario. Assume there are zero bytes free; thread Ta calls allocate(100), followed by thread Tb which asks for less memory by calling allocate(10). Both Ta and Tb thus wait on the condition and go to sleep; there aren’t enough free bytes to satisfy either of these requests.

At that point, assume a third thread, Tc, calls free(50). Unfortu- nately, when it calls signal to wake a waiting thread, it might not wake the correct waiting thread, Tb, which is waiting for only 10 bytes to be freed; Ta should remain waiting, as not enough memory is yet free. Thus, the code in the figure does not work, as the thread waking other threads does not know which thread (or threads) to wake up.

The solution suggested by Lampson and Redell is straightforward: re- place the pthread cond signal() call in the code above with a call to pthread cond broadcast(), which wakes up all waiting threads. By doing so, we guarantee that any threads that should be woken are. The downside, of course, can be a negative performance impact, as we might needlessly wake up many other waiting threads that shouldn’t (yet) be awake. Those threads will simply wake up, re-check the condition, and then go immediately back to sleep.

```c
// how many bytes of the heap are free?
int bytesLeft = MAX_HEAP_SIZE;

// need lock and condition too
cond_t c;
mutex_t m;

void * allocate(int size) {
    Pthread_mutex_lock(&m);
    while (bytesLeft < size)
    Pthread_cond_wait(&c, &m);
    void *ptr = ...; // get mem from heap
    bytesLeft -= size;
    Pthread_mutex_unlock(&m);
    return ptr;
}

void free(void *ptr, int size) {
    Pthread_mutex_lock(&m);
    bytesLeft += size;
    Pthread_cond_signal(&c); // whom to signal??
    Pthread_mutex_unlock(&m);
}
```

Lampson and Redell call such a condition a covering condition, as it covers all the cases where a thread needs to wake up (conservatively); the cost, as we’ve discussed, is that too many threads might be woken.

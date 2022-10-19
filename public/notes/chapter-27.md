---
title: CS372 Chapter 23 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Introduction To Concurrency
---

# Table of content

- [Table of content](#table-of-content)
- [Thread Creation](#thread-creation)
- [Thread Completion](#thread-completion)
- [Locks](#locks)
- [Condition Variables](#condition-variables)
- [Compiling and Running](#compiling-and-running)

# Thread Creation

```
#include <pthread.h>
int pthread_create(
  pthread_t *thread,
  const pthread_attr_t *attr,
  void *(*start_routine)(void*),
  void *arg);
```

The first parameter is a pointer to a structure of type pthread t; we’ll use this structure to interact with this thread, and thus we need to pass it to pthread create() in order to initialize it.

The second argument, attr, is used to specify any attributes this thread might have.

The third argument is the most complex, but is really just asking: which function should this thread start running in? In C, we call this a function pointer, and this one tells us the following is expected: a function name (start routine), which is passed a single argument of type void\* (as indicated in the parentheses after start routine), and which returns a value of type void \_ (i.e., a void pointer).

Finally, the fourth argument, arg, is exactly the argument to be passed to the function where the thread begins execution.

# Thread Completion

```
int pthread_join(pthread_t thread, void **value_ptr);
```

This routine takes two arguments. The first is of type pthread t, and is used to specify which thread to wait for. The second argument is a pointer to the return value you expect to get back.

# Locks

```
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

When you have a region of code that is a critical section, and thus needs to be protected to ensure correct operation, locks are quite useful. You can probably imagine what the code looks like:

```
pthread_mutex_lock(&lock);
x = x + 1; // or whatever your critical section is
pthread_mutex_unlock(&lock);
```

The intent of the code is as follows: if no other thread holds the lock when pthread mutex lock() is called, the thread will acquire the lock and enter the critical section. If another thread does indeed hold the lock, the thread trying to grab the lock will not return from the call until it has acquired the lock (implying that the thread holding the lock has released it via the unlock call).

To initialize a lock:

```
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

int rc = pthread_mutex_init(&lock, NULL);
assert(rc == 0); // always check success!
```

The lock and unlock routines are not the only routines within the
pthreads library to interact with locks. Two other routines of interest:

```
int pthread_mutex_trylock(pthread_mutex_t *mutex);
int pthread_mutex_timedlock(pthread_mutex_t *mutex, struct timespec *abs_timeout);
```

These two calls are used in lock acquisition. The trylock version returns failure if the lock is already held; the timedlock version of acquiring a lock returns after a timeout or after acquiring the lock, whichever happens first. Thus, the timedlock with a timeout of zero degenerates to the trylock case.

# Condition Variables

Condition variables are useful when some kind of signaling must take place between threads, if one thread is waiting for another to do something be- fore it can continue. Two primary routines are used by programs wishing to interact in this way:

```
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_signal(pthread_cond_t *cond);
```

The first routine, pthread cond wait(), puts the calling thread to sleep, and thus waits for some other thread to signal it, usually when something in the program has changed that the now-sleeping thread might care about.

Example use case:

```
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;
Pthread_mutex_lock(&lock);
while (ready == 0)
  Pthread_cond_wait(&cond, &lock);
Pthread_mutex_unlock(&lock);
```

The code to wake a thread, which would run in some other thread, looks like this:

```
Pthread_mutex_lock(&lock);
ready = 1;
Pthread_cond_signal(&cond);
Pthread_mutex_unlock(&lock);
```

# Compiling and Running

To compile them, you must include the header pthread.h in your code. On the link line, you must also explicitly link with the pthreads library, by adding the -pthread flag.

```
gcc -o main main.c -Wall -pthread
```

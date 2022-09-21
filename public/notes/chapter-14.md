---
title: CS372 Chapter 10 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Memory API
---

# Table of content

- [Table of content](#table-of-content)
- [Types Of Memory](#types-of-memory)
- [Malloc](#malloc)
- [Free](#free)
- [Common Errors](#common-errors)
  - [Forgetting To Allocate Memory](#forgetting-to-allocate-memory)
  - [Not Allocating Enough Memory](#not-allocating-enough-memory)
  - [Forgetting to Initialize Allocated Memory](#forgetting-to-initialize-allocated-memory)
  - [Forgetting To Free Memory](#forgetting-to-free-memory)
  - [Freeing Memory Before You Are Done With It](#freeing-memory-before-you-are-done-with-it)
  - [Calling "free()" Incorrectly](#calling-free-incorrectly)

# Types Of Memory

- Stack memory

```c
void func() {
  int x; // declares an integer on the stack
  ...
  // when func() ends, x is free, stack collapses to func()'s caller
}

```

- Heap memory

```c
void func() {
  int *x = (int *) malloc(sizeof(int)); // allocate memory in the heap
  ...
  // must free(x) at the end of func(), or else the memory is leaked. Unlike stack memory, the memory won't collapse when the call stack collapses
}
```

# Malloc

The `malloc()` call is quite simple: you pass it a size asking for some room on the heap, and it either succeeds and gives you back a pointer to the newly-allocated space, or fails and returns NULL.

# Free

As it turns out, allocating memory is the easy part of the equation; knowing when, how, and even if to free memory is the hard part.

```c
int *x = malloc(10 * sizeof(int));
  ...
  free(x);
```

# Common Errors

## Forgetting To Allocate Memory

Many routines expect memory to be allocated before you call them. For example, the routine strcpy(dst, src) copies a string from a source pointer to a destination pointer.

```c
// wrong way:
char *src = "hello";
  char *dst;        // oops! unallocated
  strcpy(dst, src); // segfault and die

// correct way
char *src = "hello";
  char *dst = (char *) malloc(strlen(src) + 1);
  strcpy(dst, src); // work properly
```

## Not Allocating Enough Memory

A related error is not allocating enough memory, sometimes called a buffer overflow.

```c
char *src = "hello";
  char *dst = (char *) malloc(strlen(src)); // too small!
  strcpy(dst, src); // work properly
```

## Forgetting to Initialize Allocated Memory

With this error, you call `malloc()` properly, but forget to fill in some values into your newly-allocated data type.

## Forgetting To Free Memory

Another common error is known as a memory leak, and it occurs when you forget to free memory. In long-running applications or systems (such as the OS itself), this is a huge problem, as slowly leaking memory even## tually leads one to run out of memory, at which point a restart is required.

## Freeing Memory Before You Are Done With It

Programs also sometimes free memory more than once; this is known as the double free. The result of doing so is undefined.

## Calling "free()" Incorrectly

`free()` expects you only to pass to it one of the pointers you received from `malloc()` earlier. When you pass in some other value, bad things can (and do) happen.

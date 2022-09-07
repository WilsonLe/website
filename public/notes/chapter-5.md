---
title: CS372 Chapter 5 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Process API
---

# Table of content

- [Table of content](#table-of-content)
- [Process](#process)
	- [The Fork System Call](#the-fork-system-call)
	- [The Wait System Call](#the-wait-system-call)
	- [The Exec System Call](#the-exec-system-call)
	- [Why These API](#why-these-api)
	- [Process Control And Users](#process-control-and-users)

# Process

UNIX offers 3 different system calls regarding a process. Process creation uses a pair of system call **fork()** and **exec()**. The third routine is **wait()**, used by a process to wait on it's child process to finish.

## The Fork System Call

The fork system call is used to create a new program. Refer to this code section:

```c
// p1.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
	printf("hello world (pid:%d)\n", (int) getpid());
	int rc = fork();
	if (rc < 0) {
		// fork failed
		fprintf(stderr, "fork failed\n");
		exit(1);
	} elseif(rc == 0){
		// child (new process)
		printf("hello, I am child (pid:%d)\n", (int) getpid());
	} else {
		// parent goes down this path (main)
		printf("hello, I am parent of %d (pid:%d)\n", rc, (int) getpid());
	}
	return 0;
}
```

When the program runs, this is the output of the program:

```
hello world (pid:29146)
hello, I am parent of 29147 (pid:29146)
hello, I am child (pid:29147)
```

The UNIX system has a unique process identifier called PID. In the code section above, the parent process has a PID of 29146, while the child has a PID of 29147. The child process created by **fork()** is an _almost exact copy of the calling process_. That means that to the OS, it now looks like there are two copies of the program **p1** running, and both are about to return from the fork() system call. The child process doesn’t start running at main(), rather it just comes into life as if it had called fork() itself.

Another interesting behavior is that the output of **p1** is not **deterministic**, meaning its output will be different on different invokcation of the program. Assuming we are running on a system with a single CPU, then either the child or the parent might run at that point. In the example invokcation above, the parent did and thus printed out its message first. In other cases, the opposite might happen and **p1** will output like this:

```
hello world (pid:29146)
hello, I am child (pid:29147)
hello, I am parent of 29147 (pid:29146)
```

The **CPU scheduler**, a topic we’ll discuss in great detail soon, determines which process runs at a given moment in time. Because the scheduler is complex, we cannot usually make strong assumptions about what it will choose to do, and hence which process will run first.

## The Wait System Call

Sometimes, as it turns out, it is quite useful for a parent to wait for a child process to finish what it has been doing. This task is accomplished with the **wait()** system call. When a parent is **waiting**, its state will be set to blocked.

In the example code below, the parent process calls wait() to delay its execution until the child finishes executing. When the child is done, wait() returns to the parent.

```c
// p2.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(int argc, char *argv[]) {
	printf("hello world (pid:%d)\n", (int) getpid());
	int rc = fork();
	if (rc < 0) {
		// fork failed; exit
		fprintf(stderr, "fork failed\n");
		exit(1);
	} else if (rc == 0){
		// child (new process)
		printf("Hello I am child (pid:%d)\n", (int) getpid());
	} else{
		int rc_wait = wait(NULL);
		printf("hello, I am parent of %d (rc_wait:%d) (pid:%d)\n", rc, rc_wait, (int) getpid());
	}
}
```

Adding a wait() call to the code above makes the output deterministic because we know that the child will always print first. This is because even if the parent process gets scheduled first, the parent process still have to wait for the child process to finish.

## The Exec System Call

This system call is useful when you want to run a program that is different from the calling program. Where as **fork()** is only useful if we want to run the exact copy of the current program, **exec()** allows us to run different program.

Behavior of **exec()**: given the name of an executable and some arguments, it loads code (and static data) from that executable and overwrites its current code segment (and current static data) with it; the heap and stack and other parts of the memory space of the program are re-initialized.

Thus, it does not create a new process; rather, it transforms the currently running program (formerly p3) into a different running program. After the exec() in the child, it is almost as if the original program never ran; a successful call to exec() never returns.

## Why These API

A UNIX shell commonly uses **fork()**, **wait()**, and **exec()** to launch user commands; the separation of **fork()** and **exec()** enables features like input/output redirection, pipes, and other cool features, all without changing anything about the programs being run.

## Process Control And Users

For example, the **kill()** system call is used to send signals to a process, including directives to **pause**, **die**, and other useful imperatives: control-c sends a SIGINT (interrupt) to the process (normally terminating it) and control-z sends a SIGTSTP (stop) signal thus pausing the process in mid-execution (you can resume it later with a command, e.g., the fg built-in command found in many shells).

Generally, the systems we use can have multiple people using them at the same time; if one of these people can arbitrarily send signals such as SIGINT (to interrupt a process, likely terminating it), the usability and security of the system will be compromised.

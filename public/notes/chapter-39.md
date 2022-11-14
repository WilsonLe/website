---
title: CS372 Chapter 39 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Interlude - Files and Directories
---

# Table of content

- [Table of content](#table-of-content)
- [Files And Directories](#files-and-directories)
- [Creating Files](#creating-files)
- [Reading And Writing Files](#reading-and-writing-files)
- [Reading And Writing, But Not Sequentially](#reading-and-writing-but-not-sequentially)
- [Shared File Table Entries: fork() And dup()](#shared-file-table-entries-fork-and-dup)
- [Writing Immediately With fsync()](#writing-immediately-with-fsync)
- [Renaming Files](#renaming-files)
- [Getting Information About Files](#getting-information-about-files)
- [Removing Files](#removing-files)
- [Making Directories](#making-directories)
- [Reading Directories](#reading-directories)
- [Deleting Directories](#deleting-directories)
- [Hard Links](#hard-links)
- [Symbolic Links](#symbolic-links)
- [Permission Bits And Access Control Lists](#permission-bits-and-access-control-lists)
- [Making And Mounting A File System](#making-and-mounting-a-file-system)

# Files And Directories

2 key abstraction for virtualizing storage

- file: contiguous array of bytes. It has a low-level name that is not exposed to the user. This name is referred to as the inode number.
- directory: also has an inode number. A directory content is a list of pairs of user-readable name, and low-level name. Each entry in a directory refers to either files or other directories.

# Creating Files

To create a file, we have a `open()` system call. The system call returns a file descriptor. A file descriptor is just an integer, private per process, and is used in UNIX systems to access files; thus, once a file is opened, you use the file descriptor to read or write the file, assuming you have permission to do so.

# Reading And Writing Files

Lets take the `cat` routine as an example for reading a file. The routine first opens the file with the read-only flag using the `open()` system call. The routine then uses the `read()` system call to read bytes from a file.

The routine also writes to a file descriptor 1, which is standard output.

# Reading And Writing, But Not Sequentially

There are use cases where you have to read or write to a specific offset within a file. The system call `lseek()` should help.

```c
off_t lseek(int fildes, off_t offset, int whence);
```

The first argument is a file descriptor. The second argument is an offset to a particular location within a file. The third argument specifies how the seek is performed:

- If whence is SEEK_SET, the offset is set to offset bytes.
- If whence is SEEK_CUR, the offset is set to its current location plus offset bytes.
- If whence is SEEK_END, the offset is set to the size of the file plus offset bytes.

# Shared File Table Entries: fork() And dup()

In many cases, the mapping of file descriptor to an entry in the open file table is a one-to-one mapping. For example, when a process runs, it might decide to open a file, read it, and then close it; in this example, the file will have a unique entry in the open file table.

Even if some other process reads the same file at the same time, each will have its own entry in the open file table. In this way, each logical reading or writing of a file is independent, and each has its own current offset while it accesses the given file.

Sharing open file table entries across parent and child is occasionally useful. For example, if you create a number of processes that are cooper- atively working on a task, they can write to the same output file without any extra coordination.

One other interesting, and perhaps more useful, case of sharing occurs with the `dup()` system call. The system call allows a process to create a new file descriptor that refers to the same underlying open file as an existing descriptor.

# Writing Immediately With fsync()

Most times when a program calls write(), the file system, for performance reasons, will buffer such writes in memory for some time (say 5 seconds, or 30); at that later point in time, the write(s) will actually be issued to the storage device.

However, some applications require something more than this eventual guarantee (i.e DBMS). We have a system call for that: `fsync()`. When a process calls fsync() for a particular file descriptor, the file system responds by forcing all dirty (i.e., not yet written) data to disk, for the file referred to by the specified file descriptor. The fsync() routine returns once all of these writes are complete.

# Renaming Files

Once we have a file, it is sometimes useful to be able to give a file a different name. We have a fairly obvious system call for that: `rename()`. This system call is usually implemented atomically with respect to system crashses (if the system crash while renaming, the file will either have the new name, or keep the old name).

# Getting Information About Files

To see the metadata for a certain file, we can use the `stat()` or `fstat()` system calls. The information might include:

- size in bytes
- low-level name
- ownership information
- when it was accessed/modified

# Removing Files

To remove a file, we uses the `unlink()` system call.

# Making Directories

To create a directory, a single system call, `mkdir()`, is available. When a new directory is created, it by default has 2 entries: the directory itself, and the parent directory.

# Reading Directories

The `ls` program uses three system calls, `opendir()`, `readdir()`, and `closedir()`, to get the job done.

# Deleting Directories

The `rmdir` program calls the similarly-named system call `rmdir()` to remove a directory. It requires the directory to be empty (only contains the default entries - itself and the parent)

# Hard Links

The `link()` system call takes two arguments, an old pathname and a new one; when you “link” a new file name to an old one, you essentially create another way to refer to the same file.

The way `link()` works is that it simply creates another name in the directory you are creating the link to, and refers it to the same inode number (i.e., low-level name) of the original file. The file is not copied in any way; rather, you now just have two human-readable names that both refer to the same file.

By now you might be starting to see why `unlink()` is called `unlink()`. When you create a file, you are really doing two things. First, you are making a structure (the inode) that will track virtually all relevant information about the file, including its size, where its blocks are on disk, and so forth. Second, you are linking a human-readable name to that file, and putting that link into a directory.

The reason we can `unlink()` a file to "delete" the file is because when the file system unlinks file, it checks a reference count within the inode number. This reference count (sometimes called the link count) allows the file system to track how many different file names have been linked to this particular inode.

When unlink() is called, it removes the “link” between the human-readable name (the file that is being deleted) to the given inode number, and decrements the reference count; only when the reference count reaches zero does the file system also free the inode and related data blocks, and thus truly “delete” the file.

# Symbolic Links

There is one other type of link that is really useful, and it is called a symbolic link or sometimes a soft link.

Hard links are somewhat limited: you can’t create one to a directory (for fear that you will create a cycle in the directory tree); you can’t hard link to files in other disk partitions (because inode numbers are only unique within a particular file system, not across file systems).

To create a soft link, we still use the `ln` program, but with a `-s` flag.

Soft links are quite different from hard links:

- The first difference is that a symbolic link is actually a file itself, of a different type.
- Removing the original file named file causes the link to point to a pathname that no longer exists.

# Permission Bits And Access Control Lists

The file system is also virtualized like the process system, but more comprehensive to enable various degree of sharing.

The first form of such mechanisms is the classic UNIX permission bits. The protection bits are represented by 9 charaters(i.e rw-r--r--) The permissions consist of three groupings: what the owner of the file can do to it, what someone in a group can do to the file, and finally, what anyone (sometimes referred to as other) can do.

For directories, the execute bit behaves a bit differently. Specifically, it enables a user (or group, or everyone) to do things like change directories (i.e., cd) into the given directory, and, in combination with the writable bit, create files therein.

# Making And Mounting A File System

How to assemble a full directory tree from many underlying file systems. This task is accomplished via first making file systems, and then mounting them to make their contents accessible.

To make a file system, most file systems provide a tool, usually referred to as mkfs (pronounced “make fs”), that performs exactly this task. The idea is as follows: give the tool, as input, a device (such as a disk partition, e.g., /dev/sda1) and a file system type (e.g., ext3), and it simply writes an empty file system, starting with a root directory, onto that disk partition.

The next task is achieved via the mount program (which makes the underlying system call mount() to do the real work). What mount does, quite simply is take an existing directory as a target mount point and essentially paste a new file system onto the directory tree at that point.

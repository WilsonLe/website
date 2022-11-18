---
title: CS372 Chapter 40 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: File System Implementation
---

# Table of content

- [Table of content](#table-of-content)
- [The Way To Think](#the-way-to-think)
- [Overall Organization](#overall-organization)
- [File Organization: The Inode](#file-organization-the-inode)
	- [The Multi-Level Index](#the-multi-level-index)
- [Directory Organization](#directory-organization)
- [Free Space Management](#free-space-management)
- [Access Paths: Reading and Writing](#access-paths-reading-and-writing)
	- [Read](#read)
	- [Writing A File To Disk](#writing-a-file-to-disk)
- [Caching and Buffering](#caching-and-buffering)

# The Way To Think

There are 2 aspects of file systems that we need to think about:

- data structures of the file system: what data structure is used on-disk to manage data and metadata.
- access methods: how does the file system map the calls made by a process, such as `open()`, `read()`, `write()`, etc., onto its structures?

# Overall Organization

Divide the disk into blocks of 4KB. Say we have a disk with 64 blocks. We use block 8-63 for data, 3-7 for inodes (also refered to as the **inode table**). We use a simple bitmap to keep track if the inodes and data are free or allocated. We use one bitmap to manage inodes, and one bitmap to manage data. These 2 bitmap takes block 1 and 2. The last block (0) is reserved for the superblock, storing data about the file system itself: where are the inodes blocks, data blocks, bitmaps, magic number to identify the file system type.


![figure 40.0](https://i.ibb.co/h9Dhxqb/40-0.png)

# File Organization: The Inode

Inode is short for index node. In this simple file system, given an inode number, we can calculate where on the disk the corresponding inode is located (simply fetch the block with offset = inode block size \* inode block number).

Inode stores metadata of a file:

![figure 40.1](https://i.ibb.co/tq02TvD/40-1.png)

## The Multi-Level Index

An inode number can have direct pointer to points to a file, and some number of indirect pointer that points to other inodes. If a file grows larger than a block that the direct pointer is pointing to, it should resort to using indirect pointer to allocate more space for that file. This can be done in multiple level, thus the multi-level index.

# Directory Organization

In this file system, directories are simply list of entry name - inode number pairs. Delete a file with `unlink()` will leave an empty space in the middle of the on-disk memory of the directory. We keep track of each record length to determine where to write a new file/directory to memory.

Directories are stored in inode table, with the type field of the inode marked as “directory” instead of “regular file”.

# Free Space Management

We need to keep track of which inodes and data blocks are free, and which are not, so that when a new directory/file is created, we know where the free spaces are to allocate them. In vsfs, we have two simple bitmaps for this task.

# Access Paths: Reading and Writing

## Read

Assumption:

- We want to open the file /foo/bar, then close it
- The file is 12KB in size (3 blocks)

1. Issue `open("/foo/bar", O RDONLY)`: the file system finds the inode for the file by traversing from the **root directory**. It reads the inode from the root (which must be known when mounting), then using the inode to find data blocks that contains the contents of the root directory. It then uses the on-disk pointers to read through the directory, looking for an entry named "foo" to find its inode number. Once found, it recursively repeat this processs until it has finish its path.
2. Once open, the program can then issue a `read()`: the first read will thus read in the first block of the file base on the inode of the file. It may also update the inode with a new last-accessed time, further update the in-memory open file table for this file descriptor, updating the file offset such that the next read will read the second file block, etc.
3. At some point, the file will be closed. There is much less work to be done here; clearly, the file descriptor should be deallocated, but for now, that is all the file system really needs to do. No disk I/Os take place.

![figure 40.3](https://i.ibb.co/8mvLHg3/40-3.png)

## Writing A File To Disk

1. First the file needs to be open with the same process above.
2. Once opened, the file system issue `write()` to update the file content. The file system may have to allocate more blocks. This complicates the process. Now each write will require (1) read the data bitmap, (2) write to the bitmap, (3) read the inode bitmap, (4) write the inode bitmap, and (5) write the data itself.
3. Closing the file should be similar

![figure 40.4](https://i.ibb.co/zs9k8kF/40-4.png)

# Caching and Buffering

Early file systems thus introduced a fixed-size cache to hold popular blocks. As in our discussion of virtual memory, strategies such as LRU and different variants would decide which blocks to keep in cache. This fixed-size cache would usually be allocated at boot time to be roughly 10% of total memory.

This static partitioning of memory, however, can be wasteful. Modern systems employ a dynamic partitioning approach by employing virtual memory pages and file system pages into a unified cache.

Consider caching on file open: the first open may generate a lot of I/O traffic to read in directory inode and data, but subsequent file opens of that same file (or files in the same directory) will mostly hit in the cache and thus no I/O is needed.

Write buffering also helps reduce I/O on writes: (1) by delaying writes, the file system can batch some updates into a smaller set of I/Os. (2) By buffering a number of writes in memory, the system can then schedule the subsequent I/Os and thus increase performance. (3) Some writes are avoided altogether by delaying them - a file is created and deleted immediately afterwards.

Modern file systems buffer writes in memory from 5-30 seconds. If the system crashes before the updates have been propagated to disk, the updates are lost. If keeping writes in memory longer, performance can be improved by batching, scheduling, and even avoiding writes.

There are options to opt out of this trade of if the default behavior is not satisfactory (i.e databases cannot tolorate data loss)

---
title: CS372 Chapter 42 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Crash Consistency - FSCK and Journaling
---

# Table of content

- [Table of content](#table-of-content)
- [Crash Consistency](#crash-consistency)
- [A Detailed Example](#a-detailed-example)
	- [Crash Scenarios](#crash-scenarios)
		- [Just the data block is written to disk](#just-the-data-block-is-written-to-disk)
		- [Just the updated inode is written to disk](#just-the-updated-inode-is-written-to-disk)
		- [Just the updated data bitmap is written to disk](#just-the-updated-data-bitmap-is-written-to-disk)
		- [The inode and data bitmap are written to disk, but not data block](#the-inode-and-data-bitmap-are-written-to-disk-but-not-data-block)
		- [The inode and the data block are written, but not the bitmap](#the-inode-and-the-data-block-are-written-but-not-the-bitmap)
		- [The data bitmap and data block are written, but not the inode](#the-data-bitmap-and-data-block-are-written-but-not-the-inode)
	- [The Crash Consistency Problem](#the-crash-consistency-problem)
- [Solution #1: The File System Checker](#solution-1-the-file-system-checker)
	- [Superblock](#superblock)
	- [Free blocks](#free-blocks)
	- [Inode state](#inode-state)
	- [Inode links](#inode-links)
	- [Duplicates](#duplicates)
	- [Bad blocks](#bad-blocks)
	- [Directory checks](#directory-checks)
- [Solution #2: Journaling (or Write-Ahead Logging)](#solution-2-journaling-or-write-ahead-logging)
	- [Data Journaling](#data-journaling)
	- [Recovery](#recovery)
	- [Batching Log Updates](#batching-log-updates)
	- [Making The Log Finite](#making-the-log-finite)
	- [Metadata Journaling](#metadata-journaling)
	- [Tricky Case: Block Reuse](#tricky-case-block-reuse)
	- [Wrapping Up Journaling: A Timeline](#wrapping-up-journaling-a-timeline)
- [Solution #3: Other Approaches](#solution-3-other-approaches)
	- [Soft Updates](#soft-updates)
	- [Copy On Write](#copy-on-write)
	- [Backpointer-based Consistency](#backpointer-based-consistency)
	- [Optimistic Crash Consistency](#optimistic-crash-consistency)

# Crash Consistency

One major challenge faced by a file system is how to update persis- tent data structures despite the presence of a power loss or system crash.

Imagine updating two on-disk structures in order to complete a particular operation. Because the disk only services a single request at a time, one of these requests will reach the disk first. If the system crashes or loses power after one write completes, the on-disk structure will be left in an inconsistent state.

# A Detailed Example

Consider the workload: appending a single data block to an existing file. This is done by opening the file, move the file offset to the end of the file, issue a 4KB write the file, finally close it.

Assume we are using standard simple file system structures on the disks: inode bitmap, data bitmap, inodes, and data blocks.

Since we are adding a new data block, we must update three on-disk structures:

1. the inode (which must point to the new block and record the new larger size due to the append)
2. the new data block
3. new version of the data bitmap to indicate that the new data block has been allocated.

## Crash Scenarios

### Just the data block is written to disk

In this case, the data is on disk, but there is no inode that points to it and no data bitmap that even says the block is allocated. Thus, it is as if the write never occurred. This case is not a problem at all.

### Just the updated inode is written to disk

In this case, the inode points to the disk address where Data block was about to be written, but data block has not yet been written there. Thus, if we trust that pointer, we will read garbage data from the disk. This creates inconsistency between the on-disk data bitmap and the inode. We need to solve this problem.

### Just the updated data bitmap is written to disk

Similar to the above scenario, there will be inconsistency between the on-disk inode and the data bitmap, this causes space-leak because the specific block will never be used by the system.

### The inode and data bitmap are written to disk, but not data block

In this case, the file system metadata is completely consistent: both the inode and the data bitmap is pointing to the specific block, but the actual data is not written, so both of them are pointing at garbage.

### The inode and the data block are written, but not the bitmap

Same problem with the case where just the updated inodes are written to disk, we have the inode pointing to the correct data on disk, but again have an inconsistency between the inode and the old version of the data bitmap.

### The data bitmap and data block are written, but not the inode

Same problem with the case where just the updated data bitmap are written, we again have an inconsistency between the inode and the data bitmap. This time, even though the data block is allocated, we don't know which file that data block belongs to (because we don't have the updated inode written).

## The Crash Consistency Problem

Ideally we would want to atomically write to the disks. Unfortunately, we can’t do this easily because the disk only commits one write at a time, and crashes or power loss may occur between these updates.

# Solution #1: The File System Checker

THe File System Checker (fsck) is a Unix tool to find the inconsistencies and fix them.

The tool fsck operates in a number of phases. It is run before the file system is mounted and made available (fsck assumes that no other file-system activity is on-going while it runs). Once finished, the on-disk file system should be consistent and thus can be made accessible to users.

## Superblock

fsck first checks if the superblock looks reasonable, mostly doing sanity checks such as making sure the file system size is greater than the number of blocks that have been allocated. If the sanity checks fail, the system (or administrator) may decide to use an alternate copy of the superblock.

## Free blocks

Next, fsck scans the inodes, indirect blocks, double indirect blocks, etc., to build an understanding of which blocks are currently allocated within the file system. This is the source of truth to compare the current data bitmap against. Same thing for inode bitmaps.

## Inode state

Each inode is checked for corruption or other problems such as valid type fields. If the inode fail these checks, it is cleared and the inode bitmap is updated accordingly.

## Inode links

fsck also verifies the link count of each allocated inode by recursively iterate through levels of the inode, sanity checking on the link count metadata, update the inode data as needed. If an allocated inode is discovered but no directory refers to it, it is moved to the lost+found directory.

## Duplicates

fsck also checks for duplicate pointers: cases where two different inodes refer to the same block. If the duplicative pointer is bad, it may be cleared; or the pointed-to block could be copied.

## Bad blocks

While iterating through list of pointers, we check on the bad-ness of it. A pointer is considered “bad” if it obviously points to something outside its valid range, e.g., it has an address that refers to a block greater than the partition size. If this fails, fsck clears the the pointer from inode table.

## Directory checks

fsck also perform basic sanity checks on directory: making sure that “.” and “..” are the first entries, that each inode referred to in a directory entry is allocated, and ensuring that no directory is linked to more than once in the entire hierarchy.

At a higher level, the basic premise of fsck is overkill (which means excessive work). It is incredibly expensive to scan the entire disk to fix problems that occurred during an update of just three blocks

# Solution #2: Journaling (or Write-Ahead Logging)

When updating the disk, before over-writing the structures in place, first log what the action is in a well known place on the disk. If a crash takes place during the update, we can look at the log and redo exactly that.

By design, journaling thus adds a bit of work during updates to greatly reduce the amount of work required during recovery.

## Data Journaling

Consider the workload of updating a data block, inode bitmap and data bitmap.

Our journal would then contains 5 components: The "Transaction begin" (txb) contains metadata about this update: final addresses of inode, data, and block, and some kind of itentifier. The next 3 blocks are exact copies of the 3 blocks we want to update. This is an example of physical logging where we make an exact duplicate of the data on the journal. Another method would be logical logging, where we store metadata of the blocks on the journal. The final block (txe) is a marker of the end of this transaction, and will also contain the previous identifier.

Once this transaction is safely on disk, we are ready to overwrite the old structures in the file system; this process is called checkpointing.

Problem is: we are still "writing" to disk when we are writing to the journal. To avoid this, the file system does it in 2 phases: (1) it writes all blocks except the txe block to the journal, issuing these writes all at once. (2) it writes the txe block. The process of writing the txe block is assume to be atomic because the disk guarantees that any 512-byte write is atomic, so we just need to make sure to pad the txe to fit in a 512 blocks.

## Recovery

If the crash happens before the transaction is written safely to the log, then our job is easy: the pending update is simply skipped.

If the crash happens after the transaction has committed to the log, but before the checkpoint is complete, the file system can recover the update as follows: When the system boots, the file system will replayed commited transactions in order.

In the worst case, some of these updates are simply per- formed again during recovery. Because recovery is a rare operation, a few redundant writes is trivial.

## Batching Log Updates

With journaling, the file system logically commit all of this information to the journal for every file update. If the files are in the same directory, and assuming they even have inodes within the same inode block, this means that if we’re not careful, we’ll end up writing these same blocks over and over.

To remedy this problem, some file systems do not commit each update to disk one at a time, but rather buffer all updates to a global transaction.

## Making The Log Finite

Memory is finite, and so is the journal. One consideration is that the larger the log, the longer operation it takes to recover, but this is trivial since recovery rarely happens.

We consider the journal more like a circular array then an open-ended array. This way, as newer commit comes in, it overwrite the old commit. Once a transaction has been checkpointed, the file system should free the space it was occupying within the journal, allowing the log space to be reused.

## Metadata Journaling

To further optimize logging, rather than duplicating an exact copy of the data (i.e inode bitmap, data bitmap, data blocks), we only log the metadata of the update operation (i.e inode bitmap and data bitmap). Note that we must write the data to disk before logging anything, otherwise, if system crashes while loggin metadata (data block has not been updated), there will be inconsistency, again.

## Tricky Case: Block Reuse

With metadata journal, a tricky situation arise: consider we have a directory /foo/, the user adds an entry to /foo/, and thus the contents of /foo/ is logged. Then the user deletes the new content, freeing the allocated data block for reuse. Then the user create another different content, of which data block reuses the data block by the previously deleted content. When this happen, because we are using metadata journalling, we are not logging the data bitmap updates, since we are reusing the block.

When replaying, the file system will overwrite the content of the new content with the old content, because according to the log, we are not updating the data bitmap.

Two solution: the simple one is to never reuse blocks until the delete of said blocks is checkpointed out of the journal. Another solution is to introduce another type of record: revoke. When deleting a directory, a revoke record will be written to the journal. During recovery, the system will first scan for those revokes, which tells the file system to ignore the transaction during recovery.

Below is the summary of physical journalling (data logging) and logical journalling (metadata logging)

## Wrapping Up Journaling: A Timeline

![figure 42.1](https://i.ibb.co/SKhMtJy/42-1.png)

![figure 42.2](https://i.ibb.co/Tbqyk8j/42-2.png)

# Solution #3: Other Approaches

## Soft Updates

This approach carefully orders all writes to the file system to ensure that the on-disk structures are never left in an inconsistent state.

For example, by writing a pointed-to data block to disk before the inode that points to it, we can ensure that the inode never points to garbage; similar rules can be derived for all the structures of the file system.

## Copy On Write

This technique never overwrites files or directories in place; rather, it places new updates to previously unused locations on disk. After a number of updates are completed, the file systems flip the root structure of the file system to include pointers to the newly updated structures. Doing so makes keeping the file system consistent straightforward.

## Backpointer-based Consistency

No ordering is enforced between writes. To achieve consistency, an additional back pointer is added to every block in the system; for example, each data block has a reference to the inode to which it belongs. When accessing a file, the file system can determine if the file is consistent by checking if the forward pointer points to a block that refers back to it. If so, everything must have safely reached disk and thus the file is consistent; if not, the file is inconsistent, and an error is returned.

## Optimistic Crash Consistency

This new approach issues as many writes to disk as possible by using a generalized form of the transaction checksum, and includes a few other techniques to detect inconsistencies should they arise. For some workloads, these optimistic techniques can improve performance by an order of magnitude.

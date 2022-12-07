---
title: CS372 Chapter 42 Reading Note
order: 1
thumbnailURL: /images/notes/swasey.jpeg
thumbnailAlt: Denison Swasey Chapel
description: Data integrity and protection
---

# Table of content

- [Table of content](#table-of-content)
- [Data Integrity And Protection](#data-integrity-and-protection)
- [Disk Failure Modes](#disk-failure-modes)
- [Handling Latent Sector Errors](#handling-latent-sector-errors)
- [Detecting Corruption: The Checksum](#detecting-corruption-the-checksum)
- [A New Problem: Misdirected Writes](#a-new-problem-misdirected-writes)
- [One Last Problem: Lost Writes](#one-last-problem-lost-writes)
- [Scrubbing](#scrubbing)
- [Overheads Of Checksumming](#overheads-of-checksumming)

# Data Integrity And Protection

Given the unreliable nature of modern storage devices, there are techniques to ensure the data you put into your storage system is the same when the storage system returns it to you.

# Disk Failure Modes

In early RAID systems, we had the assumption that either a disk is functional, or it's not. This model is called the **fail-stop** model. When it comes to error, modern disk usually boils down to having trouble accessing one or more blocks. Specifically, 2 types of common single-blocks failure: **latent-sector errors**, and **block corruption**.

LSEs arises when a disk section has been damaged in some way (physically damaged, bits being flipped by cosmic rays, etc.). If this is the case, the disk would return error if and only if the disk cannot fix itself, and user requests on that specific damaged block.

Disk corruption might occur in a way that is not detectable by the disk itself (spindle incorrectly writes to the disk due to physical interference).

# Handling Latent Sector Errors

When a storage system tries to access a block, and the disk returns an error, the storage system should simply use whatever redundancy mechanism it has to return the correct data (copy - mirror-raid system, recover - parity-raid system).

There are rare cases when attempting to fix the problem, another problem occur that prevent the disk from fixing itself (during reconstruction of a disk, an LSE is encountered). To combat this issue, we need an extra degree of redundancy: When an LSE is discovered during reconstruction, the extra parity helps to reconstruct the missing block.

# Detecting Corruption: The Checksum

The problem with disk corruption is that we cannot detect it, yet. If we were to detect that a particular block is bad, we can use the recovery method similar to handling LSEs. To detect if a block is bad, we use the **checksum** technique.

Checksum is simply the result of a function that takes a chunk of data as input and computes a function over said data, prodcing a small summary of the contents of the data. We store that checksum on the disk into sector-sized chunks, followed by the equivalent number of data blocks. When reading a data, we run the data we just read through the function, sanity check if the newly generated checksum matches the one we had earlier. This way we ensures data integrity.

# A New Problem: Misdirected Writes

What happen if the data is written correctly in terms of value, but incorrectly in terms of position it is suppose to be written to on disk. This would corrupt the block that was written to, albeit same disk or different disk.

To solve this issue, we add a **physical identifier** to the checksum, allowing us to easily detect if the position the block is written to on disk is the desired position.

# One Last Problem: Lost Writes

What happen is the data is not persisted (not written to disk at all), but the disk inform the upper layer that a write is completed. What remains is the old content block.

One solution is to **write verify**, where the disk immediately read from the block that it has just been written to, saniy check on the content of the block.

Some systems add another property to the checksum to detect lost writes: if the data is not persisted, the checksum will not match.

# Scrubbing

Checksum is checked when the block is read (not when written to). This is problematic because corrupted block could be copied to other places on the disk.

To handle this, we utilize **scrubbing**, which basically means periodically scan through the entire file system, sanity checking the checksum of every data blocks.

# Overheads Of Checksumming

Space overhead comes in 2 forms: on disk overhead, and system memory overhead. A typical checksum-to-disk ratio is 0.19% (8 byte checksum per 4kB block). If the system sanity check the 2 checksum first and discard them at once, the overhead is shortlived and should not be a concerned.

Time overhead is noticeable, considering the CPU has to run sanity check for every block of data being read. One solution is to combine data copying and checksumming into one streamlined activity: because copy is needed anyhow, combined copying/checksumming can be quite effective.

Some checksumming schemes can induce extra I/O overheads, paritcularly when checksums are stored distinctly from the data (thus requiring extra I/Os to access them), and for any extra I/O needed for background scrubbing.

The former can be reduced by design; the latter can be tuned and thus its impact limited, perhaps by controlling when such scrubbing activity takes place. The middle of the night, when most (not all!) productive workers have gone to bed, may be a good time to perform such scrubbing activity and increase the robustness of the storage system.

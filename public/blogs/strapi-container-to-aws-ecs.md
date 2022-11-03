---
title: Strapi - From Container To AWS
order: 1
thumbnailURL: /images/blogs/blog-with-nextjs/thumbnail.jpg
thumbnailAlt: logo of strapi, docker container and amazon web service elastic container service
description: How to deploy your containerized strapi application to AWS
---

# Table of content

- [Table of content](#table-of-content)
- [Cluster](#cluster)
  - [Create Cluster](#create-cluster)
  - [Create VPC](#create-vpc)
- [Storage](#storage)
  - [Create Bucket](#create-bucket)
  - [Set Bucket Permission](#set-bucket-permission)
    - [Create Bucket User](#create-bucket-user)
      - [Create Policy](#create-policy)
      - [Create User Group](#create-user-group)
      - [Create User](#create-user)
    - [Edit Bucket Policy To Accept Bucket User](#edit-bucket-policy-to-accept-bucket-user)
    - [Edit Bucket CORS](#edit-bucket-cors)
- [Database](#database)

# Cluster

## Create Cluster

1. Navigate to **AWS ECS** dashboard, create a cluster
2. Select **Networking only** option
3. Enter cluster name

## Create VPC

4. Check **Create a new VPC for this cluster** option
5. Leave default values
6. Create cluster

# Storage

## Create Bucket

7. Navigate to **AWS S3** dashboard, create a bucket
8. Enter bucket name
9. Enter bucket region
10. Choose **ACLs enabled**
11. Choose **Object writer**
12. Check **Block public access to buckets and objects granted through new public bucket or access point policies**
13. Check **Block public and cross-account access to buckets and objects through any public bucket or access point policies**
14. Create bucket
15. Navigate to [newly created bucket](#create-bucket) dashboard, select **Properties** tab, take note of the bucket **arn**

## Set Bucket Permission

### Create Bucket User

#### Create Policy

16. Navigate to **AWS IAM** dashboard, select **policies** tab, create a new policy
17. Select JSON policty and paste the following (replace your bucket arn with the [newly created bucket](#create-bucket) arn) then click create

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": ["<your bucket arn>", "<your bucket arn>/*"]
    }
  ]
}
```

18. Click next until review section
19. Enter policy name

#### Create User Group

20. Navigate to **AWS IAM** dashboard, select **user groups** tab, create a new user group
21. Enter group name
22. Scroll down to **Attach permissions policies** and checks the [newly created policy](#create-policy)

#### Create User

23. Navigate to **AWS IAM** dashboard, select **users** tab, create a new user
24. Enter user name
25. Check **access key - programmatic access** and click next to **permissions**
26. Choose the **add user to group** option, check the [newly created group](#create-user-group), click next until user is created
27. Navigate to [newly created bucket user](#create-user) and take note of the user **arn**

### Edit Bucket Policy To Accept Bucket User

28. Navigate to [newly created bucket](#create-bucket) dashboard, select **permissions** tab
29. Navigate to **bucket policy**, click edit and paste in the following (replace your user arn with the [newly created user](#create-user) arn, and your bucket arn with the [newly created bucket](#create-bucket) arn), then click save

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "<your user arn>"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": ["your bucket arn", "your bucket arn/*"]
    }
  ]
}
```

### Edit Bucket CORS

30. Navigate to [newly created bucket](#create-bucket) dashboard, select **permissions** tab
31. Navigate to **Cross-origin resource sharing (CORS)**, click edit and paste in the following, then click save

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["localhost"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

# Database

WIP...

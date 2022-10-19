---
title: DeerX System Design
order: 2
thumbnailURL: /images/blogs/deerx-system-design/deerx.jpg
thumbnailAlt: deer x logo
description: System design of fullstack mobile marketplace application with built-in chat function
---

# General

DeerX is a fullstack mobile application for Deniosn students (and guest users) with the following domain:

1. Users can put their items up for sale
2. Users can see all items for sale by other users
3. Users can query specific categories
4. Users can send direct messages to each other

# Technology Stack

Because of the relatively large scale of the application (in comparison to a group of 3 CS major college students), we have decided with the following tech stack:

1.  [React Native](https://reactnative.dev/): We decide to use React Native because of its philosophy: learn once, write anywhere. React Native compiles React code into native code that can run on various devices, including iOS, Android, Web.
2.  [Firebase](https://firebase.google.com/): Firebase provides a set of services for application development that we use for DeerX. Firebase provides a set of powerful SDKs that is supported in multiple languages. This layer of abstraction is crucial for reducing the amount of required legwork, allowing us to focus more on the application development:

    - [Firestore](https://firebase.google.com/products/firestore): A document oriented database, similar to MongoDb or DocumentDb.
    - [Authentication](https://firebase.google.com/products/auth).
    - [Storage](https://firebase.google.com/products/storage): A cloud storage service to store user uploaded content (mostly images).
    - [Cloud Messaging](https://firebase.google.com/products/cloud-messaging): A service that provides sending messages/notification to device(s).
    - Analytics: Google's analytics service to provide insights for the marketing team
    - Crashlytics: Google's application monitoring service for the devlopment team
    - Cloud functions: Google's cloud function service to run server-code without having to host a server. It handles scaling load balancing, and all other server management problems automatically.

# Application domains

In this documentation, domains are referred to as sets of code that solves a specific feature.

1. User domain: handles user infomation and interactions
2. Listing domain: handles all listing related features (create, delete, edit, and view listings)
3. Messaging domain: handles all messaging related features (create, delete, view, preview messages, and send notification)

# User Domain

Because DeerX is an application for Denison students to buy and sell items from each other, the first challenge was to ensure all users are Denison students. (There are guest users but they are not allowed to interact with Denison users). To ensure all users are Denison students, we use email link authentication. Email link authentication works by receiving email address from users, then generate a sign in link based on the email address, finally send the link as an email. Users will press on the sign in link to authenticate. There are pros and cons to this design decision.

- Pros:
  - User does not have to remember a password to authenticate. All they need to do is supply their Denison email address.
  - Since a student only has one Denison email address, this ensures only Denison student can authenticate.
  - Does not have to deal with clone accounts where a single user create multiple accounts to spam the system.
- Cons:
  - Since DeerX is a mobile app, authenticating using email link requires setting up deep links for the app to allow app to open when user press a link (instead of opening the link on their default web browser).
  - There exist a small risk where the link is exposed to the public (even though it was sent directly to the user's email address). When the link is exposed, anyone can click on the link to authenticate. A work around that we implemented was to save user's email address to local storage of the user's device. When the intended user open the link, the app will check

# Work In Progress...

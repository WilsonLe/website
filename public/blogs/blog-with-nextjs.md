---
title: Create Blogging Site With NextJS
order: 1
thumbnailURL: /images/blogs/blog-with-nextjs/thumbnail.jpg
thumbnailAlt: logo of next js and typescript
description: How I created a blogging site and deployed it using NextJS and Vercel.
---

# Table of content

- [Table of content](#table-of-content)
- [Problems of ReactJS](#problems-of-reactjs)
- [Solution of NextJS](#solution-of-nextjs)
- [Get Started](#get-started)
- [Reference](#reference)

# Problems of ReactJS

When building a ReactJS application from scratch, there are some important aspects that we need to take into consideration:

1. Your Javascript code has to be bundled (merge all your code into a single file) using a "**bundler**" like [Webpack](https://webpack.js.org), then transform into vanila JS code (i.e turn _.jsx/.tsx_ files into _.ts/.js_ files) using a "**compiler**" like [Babel](https://babeljs.io)

2. You have optimize your code for production optimization, such as code splitting. Code splitting is the process of splitting your bundled file into smaller chunks, then load the necessary chunks per user's requests. In other words, code splitting allows your bundled code to be "lazy-load" only the necessary things.

3. You might have to write server-side code to connect to your application with other services like databases, machine learning models.

4. You might have to pre-render some ReactJS page into static HTML for performance and SEO. You might want to dynamically render your application using server-side render (SSR) or client-side render (CSR).

# Solution of NextJS

NextJS is a React Framework that solves all of the above problems with built in features:

1. Pre-renders all of your code.

- NextJS offers static site generation (SSG) where it renders your React code into HTML, then deploy the HTML file to CDN for fast and reliable deliveries.
- NextJS also offers server-side rendering (SSR) where it renders React code into HTML in the server, and only update the client HTML the Reactive way.
- Most importantly, NextJS offer both of these feature on a per page basis, meaning you can decide which pages gets rendered statically, which page gets rendered dynamically.

2. Automatic code splitting to optimize code for production.

3. Built in API routes for writing server-side code.

# Get Started

Clone the following repo and follow the README.md instruction to start upload your blogs:
[https://github.com/WilsonLe/nextjs-blog-template](https://github.com/WilsonLe/nextjs-blog-template)

# Reference

- [https://nextjs.org/learn/basics/create-nextjs-app?utm_source=next-site&utm_medium=nav-cta&utm_campaign=next-website](https://nextjs.org/learn/basics/create-nextjs-app?utm_source=next-site&utm_medium=nav-cta&utm_campaign=next-website)

- [https://reactjs.org/docs/code-splitting.html](https://reactjs.org/docs/code-splitting.html)

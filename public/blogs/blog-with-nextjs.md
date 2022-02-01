---
title: Create a blogging site with NextJS.
order: 1
thumbnailURL: /images/blogs/my-first-blog/thumbnail.jpg
thumbnailAlt: thumbnail description
description: How I created a blogging site and deployed it using NextJS and Vercel.
---

# Table of content

- [What is NextJS](#what-is-nextjs)
  - [The problem with ReactJS](##the-problem-with-reactjs)
  - [The solution of NextJS](##the-solution-of-nextjs)
- [Get Started](#get-started)
- [Reference](#reference)

# What is NextJS

## The problem with ReactJS

When building a ReactJS application from scratch, there are some important aspects that we need to take into consideration:

1. Your Javascript code has to be bundled (merge all your code into a single file) using a "**bundler**" like [Webpack](https://webpack.js.org), then transform into vanila JS code (i.e turn _.jsx/.tsx_ files into _.ts/.js_ files) using a "**compiler**" like [Babel](https://babeljs.io)

2. You have optimize your code for production optimization, such as code splitting. Code splitting is the process of splitting your bundled file into smaller chunks, then load the necessary chunks per user's requests. In other words, code splitting allows your bundled code to be "lazy-load" only the necessary things.

3. You might have to write server-side code to connect to your application with other services like databases, machine learning models.

4. You might have to pre-render some ReactJS page into static HTML for performance and SEO. You might want to dynamically render your application using server-side render (SSR) or client-side render (CSR).

# Get started

# Reference

- [https://nextjs.org/learn/basics/create-nextjs-app?utm_source=next-site&utm_medium=nav-cta&utm_campaign=next-website](https://nextjs.org/learn/basics/create-nextjs-app?utm_source=next-site&utm_medium=nav-cta&utm_campaign=next-website)

- [https://reactjs.org/docs/code-splitting.html](https://reactjs.org/docs/code-splitting.html)

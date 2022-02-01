import { ProjectCard } from '../types';

const config = {
  // navigation bar
  navBar: {
    // website logo, displayed on the top left
    logo: {
      // the logo as text
      text: 'Wilson Le',
    },

    // navigation bar buttons, displayed in top right
    buttons: [
      {
        // button text
        text: 'Home',

        // button link. This should not be changed.
        href: '/',
      },
      {
        // button text
        text: 'Projects',

        // button link. This should not be changed.
        href: '/projects',
      },
      {
        // button text
        text: 'Blogs',

        // button link. This should not be changed.
        href: '/blogs',
      },
    ],
  },

  // footer, displayed on bottom
  footer: {},

  // home page
  homePage: {
    // title displayed on a tab
    title: 'Wilson Le',

    // description of website. Useful for screen readers
    description:
      'Wilson Le personal website for displaying projects and blogs.',

    // resume url
    resumeURL: '/pdfs/resume.pdf',

    // home page banner config
    banner: {
      // url of banner image
      imageURL: '/images/home/banner.jpeg',

      // description of banner image
      imageAlt: 'Picture of Wilson Le',

      // header1 value
      header1: 'About Me',

      // header2 value
      header2: `Hi, I'm Wilson Le`,

      // paragraph1 value
      paragraph1: `I'm a Computer Science and Data Analytics Major at Denison University. I'm a Fullstack application engineer/developer, with experience in React, React Native, TailwindCSS, NodeJS, MongoDb, Firebase.`,

      // paragraph2 value
      paragraph2: `I develop applications that create impacts for people around me, such as secondary marketplace and chat application for Denison using React Native. I also develop applications makes daily task more convenient, such as an API that checks laundry status of our univeristy dorms using NodeJS, or an application that splits the bill amongst friends using React.`,
    },

    // home page blog section
    blogs: {
      // title of blog section
      title: 'My Blogs',

      // subtitle of blog section
      subtitle: 'My software engineering stories',
    },

    // home page project section
    projects: {
      // title of blog section
      title: 'My Projects',

      // subtitle of blog section
      subtitle: 'Products of my software engineering journey',
    },
  },

  // blogs page
  blogs: {
    // blog banner
    banner: {
      // banner image url
      imageURL: '/images/blogs/banner.jpg',

      // banner image description
      imageAlt: 'temporary implementation',

      // banner title
      title: 'My Blogs',

      // banner subtitle
      subtitle:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
  },

  // projects page
  projects: {
    // blog banner
    banner: {
      // banner image url
      imageURL: '/images/projects/banner.jpg',

      // banner image description
      imageAlt: 'temporary implementation',

      // banner title
      title: 'My Projects',

      // banner subtitle
      subtitle:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
    cards: [
      {
        title: 'Digital Year Book Of Class 17-20',
        href: 'https://github.com/WilsonLe/win-of-1720',
        description:
          'Window 7 themed digital yearbook of Tran Dai Nghia students, class of 2020, are proud of. Developed using ReactJS, hosted on Vercel.',
        thumbnailURL: '/images/projects/win-of-1720.jpg',
        thumbnailAlt:
          'thumbnail of the Digital Year Book Of Class 17-20 project',
        order: '1',
      },
      {
        title: 'Vanila JS To Do Application',
        href: 'https://github.com/WilsonLe/js-todo-app',
        description:
          'A simple To Do Application that persists data across sessions. Built using vanila Javascript, hosted on Netlify.',
        thumbnailURL: '/images/projects/todo.jpg',
        thumbnailAlt: 'thumbnail of the To Do Application project',
        order: '2',
      },
      {
        title: 'ReactJS Music Player',
        href: 'https://github.com/WilsonLe/react-music-player',
        description:
          'A clean, minimalistic, responsive music player web application, with customizable music library. Developed using ReactJS, hosted on Vercel.',
        thumbnailURL: '/images/projects/music-player.jpg',
        thumbnailAlt: 'thumbnail of the ReactJS Music Player project',
        order: '3',
      },
      {
        title: 'Denison Laundry Status API',
        href: 'https://github.com/WilsonLe/Denison-Washroom-Status',
        description:
          'API for checking status of washers and dryers of Denison University residential halls. Developed using NodeJS, Docker, deployed on Digital Ocean.',
        thumbnailURL: '/images/projects/laundry-status.jpg',
        thumbnailAlt: 'Thumbnail of Denison Laundry Status API project',
        order: '4',
      },
      {
        title: 'Split The Bill',
        href: 'https://github.com/WilsonLe/split-the-bill',
        description:
          'Simple Bill Splitting Application. Invite your friends to split a bill, enter the expenses, the app will do the splitting. Developed using ReactJS, Firebase.',
        thumbnailURL: '/images/projects/split-the-bill.jpg',
        thumbnailAlt: 'Thumbnail of Split The Bill project',
        order: '5',
      },
      {
        title: 'NextJS Blog Template',
        href: 'https://github.com/WilsonLe/nextjs-blog-template',
        description:
          'A template for simple blog writing. Upload blogs that are written in markdown files. Customizable text and links. Developed using NextJS.',
        thumbnailURL: '/images/projects/blog-template.jpg',
        thumbnailAlt: 'Thumbnail of NextJS Blog Template project',
        order: '6',
      },
    ],
  },
};

export default config;

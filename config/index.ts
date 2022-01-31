import { ProjectCard } from '../types';

const config = {
  // navigation bar
  navBar: {
    // website logo, displayed on the top left
    logo: {
      // the logo url. "/logo.jpg" means in folder "public", file "logo.jpg"
      url: '/logo.jpg',

      // description of the logo. This is useful when the a reader fails to load the logo, this text will be displayed instead.
      alt: 'Wilson Le',
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
      imageURL: '/images/blogs/banner.jpeg',

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
      imageURL: '/images/blogs/banner.jpeg',

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
        href: 'https://github.com/WilsonLe',
        title: '1',
        order: '1',
        description: 'string',
        thumbnailURL: '/string',
        thumbnailAlt: 'string',
      },
      {
        href: 'string',
        title: '2',
        order: '2',
        description: 'string',
        thumbnailURL: '/string',
        thumbnailAlt: 'string',
      },
    ] as ProjectCard[],
  },
};

export default config;

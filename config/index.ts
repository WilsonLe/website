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
    title: 'NextJS Blog Template',

    // description of website. Useful for screen readers
    description: 'NextJS Blog Template description',

    // home page banner config
    banner: {
      // url of banner image
      imageURL: '/images/home/banner.jpeg',

      // description of banner image
      imageAlt: 'temporary implementation. replace this',

      // header1 value
      header1: 'Header 1',

      // header2 value
      header2: 'Header 2',

      // paragraph1 value
      paragraph1: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`,

      // paragraph2 value
      paragraph2: `It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    },

    // home page blog section
    blogs: {
      // title of blog section
      title: 'My Blogs',

      // subtitle of blog section
      subtitle: 'Here lies my blogs. Temporary implementation.',
    },

    // home page project section
    projects: {
      // title of blog section
      title: 'My Projects',

      // subtitle of blog section
      subtitle: 'Here lies my projects. Temporary implementation.',
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

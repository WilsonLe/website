import { GetStaticProps, NextPage } from 'next';
import { useEffect } from 'react';
import BlogBanner from '../../components/Blogs/BlogBanner';
import BlogList from '../../components/Blogs/BlogList';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import { getSortedBlogHeadersData } from '../../lib/blogs';
import { BlogHeaderData } from '../../types';

interface Props {
  blogHeaders: BlogHeaderData[];
}

const getStaticProps: GetStaticProps = async () => {
  const blogHeaders: BlogHeaderData[] = await getSortedBlogHeadersData();
  return {
    props: { blogHeaders },
  };
};

const Blogs: NextPage<Props> = ({ blogHeaders }) => {
  return (
    <>
      <nav>
        <Nav />
      </nav>
      <main>
        <BlogBanner />
        <BlogList blogHeaders={blogHeaders} />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};
export { getStaticProps };
export default Blogs;

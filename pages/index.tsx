import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Nav from '../components/Nav';
import Banner from '../components/Home/Banner';
import Footer from '../components/Footer';
import config from '../config';
import { BlogHeaderData, ProjectCard } from '../types';
import { getSortedBlogHeadersData } from '../lib/blogs';
import Blogs from '../components/Home/Blogs';
import Projects from '../components/Home/Projects';

interface Props {
	blogHeaders: BlogHeaderData[];
	projectCards: ProjectCard[];
}

const getStaticProps: GetStaticProps = async () => {
	const blogHeaders: BlogHeaderData[] = await getSortedBlogHeadersData();
	if (blogHeaders.length > 3) {
		blogHeaders.splice(3);
	}

	const projectCards = config.projects.cards.sort(
		(a, b) => parseInt(b.order) - parseInt(a.order)
	);

	if (projectCards.length > 3) {
		projectCards.splice(3);
	}
	return {
		props: { blogHeaders, projectCards },
	};
};

const Home: NextPage<Props> = ({ blogHeaders, projectCards }) => {
	return (
		<div>
			<Head>
				<title>{config.homePage.title}</title>
				<meta
					name='description'
					content={config.homePage.description}
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<nav>
				<Nav />
			</nav>
			<main>
				<Banner />
				<Blogs blogHeaders={blogHeaders} />
				<Projects projectCards={projectCards} />
			</main>

			<footer>
				<Footer />
			</footer>
		</div>
	);
};

export { getStaticProps };
export default Home;

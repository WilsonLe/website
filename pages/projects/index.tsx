import { GetStaticProps, NextPage } from 'next';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import ProjectBanner from '../../components/Projects/ProjectBanner';
import ProjectList from '../../components/Projects/ProjectList';
import config from '../../config';
import { ProjectCard } from '../../types';

interface Props {
  projectCards: ProjectCard[];
}

const getStaticProps: GetStaticProps = async () => {
  const projectCards: ProjectCard[] = config.projects.cards.sort(
    (a, b) => parseInt(b.order) - parseInt(a.order)
  );
  return {
    props: { projectCards },
  };
};

const Projects: NextPage<Props> = ({ projectCards }) => {
  return (
    <>
      <nav>
        <Nav />
      </nav>
      <main>
        <ProjectBanner />
        <ProjectList projectCards={projectCards} />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};
export { getStaticProps };
export default Projects;

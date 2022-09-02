import { GetStaticProps, NextPage } from 'next';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import NoteBanner from '../../components/Notes/NoteBanner';
import NoteList from '../../components/Notes/NoteList';
import { getSortedNoteHeadersData } from '../../lib/notes';
import { NoteHeaderData } from '../../types';

interface Props {
  noteHeaders: NoteHeaderData[];
}

const getStaticProps: GetStaticProps = async () => {
  const noteHeaders: NoteHeaderData[] = await getSortedNoteHeadersData();
  return {
    props: { noteHeaders },
  };
};

const Notes: NextPage<Props> = ({ noteHeaders }) => {
  return (
    <>
      <nav>
        <Nav />
      </nav>
      <main>
        <NoteBanner />
        <NoteList noteHeaders={noteHeaders} />
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export { getStaticProps };

export default Notes;

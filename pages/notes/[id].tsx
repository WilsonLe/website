import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';
import { getAllNoteIds, getNoteData } from '../../lib/notes';
import { NoteData } from '../../types';

interface Props {
  NoteData: NoteData | null;
}

const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllNoteIds();
  return {
    paths,
    fallback: false,
  };
};

const getStaticProps: GetStaticProps = async ({ params }) => {
  const NoteData = await getNoteData(params?.id as string);
  return {
    props: { NoteData },
  };
};

const ResearchBlog: NextPage<Props> = ({ NoteData }) => {
  return (
    <>
      <nav>
        <Nav />
      </nav>
      <main className="w-full">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {NoteData !== null ? (
            <>
              <h1 className=" font-bold text-4xl text-center">
                {NoteData.title}
              </h1>
              <div className="max-w-2xl mx-auto my-8">
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{
                    __html: NoteData.htmlContent,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h1 className=" font-bold text-4xl">
                Invalid blog data. Please check your markdown file.
              </h1>
            </>
          )}
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
};
export { getStaticPaths, getStaticProps };

export default ResearchBlog;

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { BlogData, BlogHeaderData, NoteHeaderData } from '../types';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const notesDir = path.join(process.cwd(), 'public', 'notes');

/**
 * utility function to get all blog ids from personal blog upload directory
 * @returns an array of id as string
 */
export async function getAllNoteIds() {
  const fileNames = await fs.readdir(notesDir);
  const postIds = fileNames.map((fileName) => ({
    params: { id: fileName.replace(/\.md$/, '') },
  }));

  return postIds;
}

/**
 * utility function to get all blog data from personal blog upload directory
 * @returns an array of blog data
 */
export async function getSortedNoteHeadersData() {
  const fileNames = await fs.readdir(notesDir);
  const markdownFiles = fileNames.filter((name) => name.endsWith('.md'));
  const allPostsData = await Promise.all(
    markdownFiles.map(async (fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(notesDir, fileName);

      const fileContents = await fs.readFile(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // validate matter result
      if (
        'order' in matterResult.data &&
        'title' in matterResult.data &&
        'description' in matterResult.data &&
        'thumbnailURL' in matterResult.data &&
        'thumbnailAlt' in matterResult.data
      ) {
        const noteHeaderData: NoteHeaderData = {
          id,
          order: matterResult.data.order,
          title: matterResult.data.title,
          description: matterResult.data.description,
          thumbnailURL: matterResult.data.thumbnailURL,
          thumbnailAlt: matterResult.data.thumbnailAlt,
        };
        return noteHeaderData;
      } else {
        return null;
      }
    })
  );

  const filteredAllPostsData: BlogHeaderData[] = allPostsData.filter(
    (x): x is BlogHeaderData => x !== null
  );
  // Sort posts by date
  return filteredAllPostsData.sort(
    (a, b) => parseInt(b.order) - parseInt(a.order)
  );
}

export async function getNoteData(id: string) {
  const fullPath = path.join(notesDir, `${id}.md`);
  const fileContents = await fs.readFile(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(matterResult.content);

  const htmlContent = processedContent.toString();

  if (
    'order' in matterResult.data &&
    'title' in matterResult.data &&
    'description' in matterResult.data &&
    'thumbnailURL' in matterResult.data &&
    'thumbnailAlt' in matterResult.data
  ) {
    const blogData: BlogData = {
      id,
      order: matterResult.data.order,
      title: matterResult.data.title,
      description: matterResult.data.description,
      thumbnailURL: matterResult.data.thumbnailURL,
      thumbnailAlt: matterResult.data.thumbnailAlt,
      htmlContent,
      hidden: false,
    };
    return blogData;
  } else {
    return null;
  }
}

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { BlogData, BlogHeaderData } from '../types';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const blogsDir = path.join(process.cwd(), 'public', 'blogs');

/**
 * utility function to get all blog ids from personal blog upload directory
 * @returns an array of id as string
 */
export async function getAllBlogIds() {
  const fileNames = await fs.readdir(blogsDir);
  const postIds = fileNames.map((fileName) => ({
    params: { id: fileName.replace(/\.md$/, '') },
  }));

  return postIds;
}

/**
 * utility function to get all blog data from personal blog upload directory
 * @returns an array of blog data
 */
export async function getSortedBlogHeadersData() {
  const fileNames = await fs.readdir(blogsDir);
  const markdownFiles = fileNames.filter((name) => name.endsWith('.md'));
  const allPostsData = await Promise.all(
    markdownFiles.map(async (fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(blogsDir, fileName);

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
        const blogHeaderData: BlogHeaderData = {
          id,
          order: matterResult.data.order,
          title: matterResult.data.title,
          description: matterResult.data.description,
          thumbnailURL: matterResult.data.thumbnailURL,
          thumbnailAlt: matterResult.data.thumbnailAlt,
        };
        return blogHeaderData;
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

export async function getBlogData(id: string) {
  const fullPath = path.join(blogsDir, `${id}.md`);
  const fileContents = await fs.readFile(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
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
    };
    return blogData;
  } else {
    return null;
  }
}

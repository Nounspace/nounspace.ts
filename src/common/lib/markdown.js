import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const markdownDirectory = path.join(process.cwd(), 'markdown');

export function getAllMarkdownFiles() {
  const fileNames = fs.readdirSync(markdownDirectory);
  return fileNames.map(fileName => {
    const fullPath = path.join(markdownDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug: fileName.replace(/\.md$/, ''),
      ...matterResult.data,
    };
  });
}

export function getMarkdownFileBySlug(slug) {
  const fullPath = path.join(markdownDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    ...matterResult.data,
    content: matterResult.content,
  };
}

export function getAllSlugs() {
  const fileNames = fs.readdirSync(markdownDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

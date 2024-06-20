import { getMarkdownFileBySlug, getAllSlugs } from '../../../lib/markdown';
import { remark } from 'remark';
import html from 'remark-html';

export default function Post({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.bio}</p>
      <img src={post.image} alt={post.title} />
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getAllSlugs();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getMarkdownFileBySlug(params.slug);
  const processedContent = await remark()
    .use(html)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return {
    props: {
      post: {
        ...post,
        contentHtml,
      },
    },
  };
}

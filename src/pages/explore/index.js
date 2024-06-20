import Link from 'next/link';
import { getAllMarkdownFiles } from '../../../lib/markdown';

export default function Explore({ posts }) {
  return (
    <div>
      <h1>Explore</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/explore/${post.slug}`}>
              <a>
                <h2>{post.title}</h2>
                <p>{post.bio}</p>
                <img src={post.image} alt={post.title} />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const posts = getAllMarkdownFiles();
  return {
    props: {
      posts,
    },
  };
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllMarkdownFiles } from "@/common/data/explore/loadExploreMarkdown";

export async function getStaticProps() {
  const posts = await getAllMarkdownFiles();
  return {
    props: {
      posts,
    },
  };
}

export default function Explore({ posts }) {
  return (
    <div>
      <h1>Explore</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/explore/${post.slug}`}>
              <h2>{post.title}</h2>
              <p>{post.bio}</p>
              <Image src={post.image} alt={post.title} fill />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

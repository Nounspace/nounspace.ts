import React, { Suspense } from "react";
import { remark } from "remark";
import html from "remark-html";
import {
  getAllSlugs,
  getMarkdownFileBySlug,
} from "@/common/data/explore/loadExploreMarkdown";
import { isNull, isObject, isUndefined, map } from "lodash";
import Image from "next/image";

type ExplorePost = {
  title: string;
  image: string;
  bio: string;
  contentHtml: string;
  slug: string;
};

type SlugOnlyPost = {
  slug: string;
};

function isExplorePost(maybe: unknown): maybe is ExplorePost {
  return (
    !isUndefined(maybe) &&
    isObject(maybe) &&
    typeof maybe["title"] === "string" &&
    typeof maybe["image"] === "string" &&
    typeof maybe["bio"] === "string" &&
    typeof maybe["contentHtml"] === "string" &&
    typeof maybe["slug"] === "string"
  );
}

export async function generateStaticParams() {
  // During build time, we may not have access to Supabase credentials
  // so we'll generate params dynamically instead
  try {
    const slugs = await getAllSlugs();
    return map(slugs, (s) => ({ slug: s }));
  } catch (error) {
    console.warn('Failed to get static params for explore, falling back to dynamic routing:', error);
    return [];
  }
}

const getPostOrSlug = async (
  slug: string,
): Promise<ExplorePost | SlugOnlyPost> => {
  const post = await getMarkdownFileBySlug(slug);
  if (isNull(post)) {
    return {
      slug,
    };
  }

  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();
  return {
    ...post,
    contentHtml,
  };
};

export default async function Post({ params }) {
  const resolvedParams = await params;
  if (!resolvedParams?.slug) {
    // Handle missing slug case
    return <div>Invalid route</div>;
  }
  const post = await getPostOrSlug(resolvedParams.slug as string);
  if (isExplorePost(post)) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <h1>{post.title}</h1>
          <p>{post.bio}</p>
          <Image src={post.image} alt={post.title} fill />
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </div>
      </Suspense>
    );
  }
  return (
    <div>
      <h1>Cannot find info for slug: {post.slug}</h1>
    </div>
  );
}

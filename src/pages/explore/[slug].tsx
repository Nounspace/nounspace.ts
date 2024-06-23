import React from "react";
import { remark } from "remark";
import html from "remark-html";
import {
  getAllSlugs,
  getMarkdownFileBySlug,
} from "@/common/data/explore/loadExploreMarkdown";
import { GetStaticProps, InferGetStaticPropsType } from "next/types";
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

export async function getStaticPaths() {
  const slugs = await getAllSlugs();
  return {
    paths: map(slugs, (s) => ({
      params: {
        slug: s,
      },
    })),
    fallback: false,
  };
}

export const getStaticProps = (async ({ params }) => {
  const post = await getMarkdownFileBySlug(params!.slug as string);
  if (isNull(post)) {
    return {
      props: {
        post: {
          slug: params!.slug as string,
        },
      },
    };
  }
  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

  return {
    props: {
      post: {
        ...post,
        contentHtml,
      },
    },
  };
}) satisfies GetStaticProps<{
  post: ExplorePost | SlugOnlyPost;
}>;

export default function Post({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (isExplorePost(post)) {
    return (
      <div>
        <h1>{post.title}</h1>
        <p>{post.bio}</p>
        <Image src={post.image} alt={post.title} fill />
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </div>
    );
  }
  return (
    <div>
      <h1>Cannot find info for slug: {post.slug}</h1>
    </div>
  );
}

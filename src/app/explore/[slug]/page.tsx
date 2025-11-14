import React, { Suspense } from "react";
import Image from "next/image";
import { remark } from "remark";
import html from "remark-html";

import { loadSystemConfig } from "@/config";
import ExploreTabPage from "../ExploreTabPage";
import {
  getAllSlugs,
  getMarkdownFileBySlug,
  type PostData,
} from "@/common/data/explore/loadExploreMarkdown";

interface ExplorePost extends PostData {
  contentHtml: string;
}

const isExplorePost = (maybe: unknown): maybe is ExplorePost => {
  if (!maybe || typeof maybe !== "object") {
    return false;
  }
  const candidate = maybe as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.image === "string" &&
    typeof candidate.bio === "string" &&
    typeof candidate.contentHtml === "string" &&
    typeof candidate.slug === "string"
  );
};

const buildPost = async (slug: string): Promise<ExplorePost | { slug: string }> => {
  const post = await getMarkdownFileBySlug(slug);
  if (!post) {
    return { slug };
  }

  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

  return {
    ...post,
    contentHtml,
  };
};

export async function generateStaticParams() {
  const config = loadSystemConfig();
  const tabParams = config.explorePage.tabOrder.map((tab) => ({ slug: tab }));
  const slugs = await getAllSlugs();
  const slugParams = slugs.map((slug) => ({ slug }));

  const merged = new Map<string, { slug: string }>();
  [...tabParams, ...slugParams].forEach((param) => {
    merged.set(param.slug, { slug: param.slug });
  });

  return Array.from(merged.values());
}

export default async function ExploreEntry({
  params,
}: {
  params: { slug: string };
}) {
  const config = loadSystemConfig();
  const tabName = decodeURIComponent(params.slug);

  if (config.explorePage.tabs[tabName]) {
    return <ExploreTabPage tabName={tabName} explorePage={config.explorePage} />;
  }

  const post = await buildPost(tabName);

  if (isExplorePost(post)) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-base text-muted-foreground">{post.bio}</p>
          </header>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
            <Image src={post.image} alt={post.title} fill className="object-cover" />
          </div>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </Suspense>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Cannot find info for slug: {post.slug}</h1>
      <p className="text-muted-foreground">
        The requested explore entry does not match a configured tab or published post.
      </p>
    </div>
  );
}

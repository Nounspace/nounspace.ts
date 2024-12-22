import matter from "gray-matter";
import supabaseClient from "../database/supabase/clients/server";
import { endsWith, filter, isNull, map, startsWith } from "lodash";
import { type FileObject } from "@supabase/storage-js";

export type PostData = {
  slug: string;
} & MatterResultData;

type MatterResultData = {
  category: string;
  title: string;
  bio: string;
  image: string;
  [key: string]: string;
};

export async function getAllMarkdownFiles(): Promise<PostData[]> {
  const { data, error } = await supabaseClient.storage.from("explore").list();
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return [];
    }
    return Promise.all(
      map(data, (d: FileObject) =>
        getMarkdownFileBySlug(d.name.replace(/\.md$/, "")),
      ),
    );
  }
}

export async function getMarkdownFileBySlug(
  slug: string,
): Promise<PostData | null> {
  const { data, error } = await supabaseClient.storage
    .from("explore")
    .download(`${slug}.md`);
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return null;
    }
    const matterResult = matter(await data.text());
    return {
      slug,
      ...(matterResult.data as MatterResultData),
      content: matterResult.content,
    };
  }
}

export async function getAllSlugs() {
  const { data, error } = await supabaseClient.storage.from("explore").list();
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return [];
    }
    return map(
      filter(data, (d) => endsWith(d.name, ".md") && !startsWith(d.name, ".")),
      (d) => d.name.replace(/\.md$/, ""),
    );
  }
}

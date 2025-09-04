import matter from "gray-matter";
import createSupabaseServerClient from "../database/supabase/clients/server";
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
  const { data, error } = await createSupabaseServerClient()
    .storage
    .from("explore")
    .list();
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return [];
    }
    const results = await Promise.all(
      data.map((d: FileObject) =>
        getMarkdownFileBySlug(d.name.replace(/\.md$/, "")),
      ),
    );
    return results.filter((d): d is PostData => d !== null);
  }
}

export async function getMarkdownFileBySlug(
  slug: string,
): Promise<PostData | null> {
  const { data, error } = await createSupabaseServerClient()
    .storage
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
  const { data, error } = await createSupabaseServerClient()
    .storage
    .from("explore")
    .list();
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return [];
    }
    return data
      .filter((d: FileObject) => endsWith(d.name, ".md") && !startsWith(d.name, "."))
      .map((d) => d.name.replace(/\.md$/, ""));
  }
}

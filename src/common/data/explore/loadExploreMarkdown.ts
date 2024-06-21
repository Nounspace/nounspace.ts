import matter from "gray-matter";
import supabaseClient from "../database/supabase/clients/server";
import { isNull, map } from "lodash";

type MatterResultData = {
  title: string;
  bio: string;
  image: string;
  [key: string]: string;
};

export async function getAllMarkdownFiles() {
  const { data, error } = await supabaseClient.storage.from("explore").list();
  if (error) {
    throw error;
  } else {
    if (isNull(data)) {
      return [];
    }
    return Promise.all(
      map(data, (d) => getMarkdownFileBySlug(d.name.replace(/\.md$/, ""))),
    );
  }
}

export async function getMarkdownFileBySlug(slug: string) {
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
    return map(data, (d) => d.name.replace(/\.md$/, ""));
  }
}

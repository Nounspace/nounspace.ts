import React, { ReactNode } from "react";

import EmbeddedNounsApp from "@/nouns/EmbeddedNounsApp";

import HomeClient from "./HomeClient";

const DEFAULT_TAB = "Nouns";

type PageProps = {
  params: Promise<{ tabname?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sanitizeTabParam = (value: string | undefined) => {
  if (!value) return DEFAULT_TAB;
  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.error("Failed to decode tabname", error);
    return DEFAULT_TAB;
  }
};

export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const tabParam = sanitizeTabParam(resolvedParams?.tabname);
  const nounsContent: ReactNode = (
    <EmbeddedNounsApp searchParams={resolvedSearchParams ?? {}} />
  );

  return <HomeClient initialTabName={tabParam} nounsContent={nounsContent} />;
}

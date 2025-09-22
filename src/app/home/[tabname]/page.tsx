import React, { ReactNode } from "react";

import EmbeddedNounsApp from "@/nouns/EmbeddedNounsApp";

import HomeClient from "./HomeClient";

const DEFAULT_TAB = "Nouns";

type PageProps = {
  params: { tabname?: string };
  searchParams: Record<string, string | string[] | undefined>;
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

export default function Page({ params, searchParams }: PageProps) {
  const tabParam = sanitizeTabParam(params?.tabname);
  const nounsContent: ReactNode = (
    <EmbeddedNounsApp searchParams={searchParams ?? {}} />
  );

  return <HomeClient initialTabName={tabParam} nounsContent={nounsContent} />;
}

import React from "react";
import { Suspense } from "react";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { getAllNounsUncached } from "@nouns/data/noun/getAllNouns";
import NounExplorer from "@nouns/components/NounExplorer";
import AnimationGird from "@nouns/components/NounExplorer/NounGrid/AnimationGrid";
import { getFrameMetadata } from "frog/next";

export async function generateMetadata(props: {
  searchParams: Promise<{ nounId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const nounId = searchParams?.nounId;

  let filteredFrameMetadata: Record<string, string> = {};
  if (nounId) {
    try {
      const frameMetadata = await getFrameMetadata(
        `https://frames.paperclip.xyz/nounswap/noun/1/${nounId}`,
      );

      // Only take fc:frame tags (not og image overrides)
      filteredFrameMetadata = Object.fromEntries(
        Object.entries(frameMetadata).filter(([k]) => k.includes("fc:frame")),
      );
    } catch (e) {
      console.error("Failed to fetch frame metadata", e);
    }
  }

  return {
    title: "Explore Nouns - Browse Unique NFTs and Traits | Nouns DAO",
    description:
      "Dive into the world of Nouns. Browse thousands of unique Noggle wearing digital pixel-art NFTs, filter by traits, and discover the magic behind Nouns DAO. Start exploring today!",
    alternates: {
      canonical: "./",
    },
    other: filteredFrameMetadata,
  };
}

export default async function Page() {
  return (
    <div className="flex w-full flex-col gap-8 p-6 md:gap-12 md:p-10">
      <div>
        <h2 className="pb-1">Explore Nouns</h2>
        <div className="paragraph-lg">
          Explore all Nouns, filter by traits, instant swap, treasury Nouns and
          buy it now.
        </div>
      </div>
      <Suspense
        fallback={
          <div className="w-full">
            <AnimationGird
              items={Array(40)
                .fill(0)
                .map((_, i) => ({
                  element: (
                    <Skeleton className="relative flex aspect-square h-full w-full rounded-2xl bg-background-secondary" />
                  ),
                  id: i,
                }))}
            />
          </div>
        }
      >
        <NounExplorerWrapper />
      </Suspense>
    </div>
  );
}

async function NounExplorerWrapper() {
  const allNouns = await getAllNounsUncached();
  return <NounExplorer nouns={allNouns} />;
}

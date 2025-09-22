import { FloatingNounsBackground } from "@nouns/components/FloatingNounsBackground";
import PostOverview from "@nouns/components/PostOverview";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { getPostOverviews } from "@nouns/data/cms/getPostOverviews";
import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { Suspense } from "react";

export default async function LearnPage() {
  return (
    <div className="flex w-full max-w-[800px] flex-col justify-center gap-[72px] p-6 pb-24 md:p-10 md:pb-24">
      <section className="relative flex flex-col items-center justify-center gap-4">
        <Suspense fallback={<div className="h-[120px] w-[400px]" />}>
          <FloatingNounsBackgroundWrapper />
        </Suspense>
        <div className="flex flex-col gap-3 text-center">
          <h1>Learn about Nouns DAO</h1>
          <p className="text-content-secondary paragraph-lg">
            Build your Nouns knowledge with these guides, tutorials, and
            explainers.
          </p>
        </div>
      </section>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <Suspense
          fallback={Array(10)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-[340px] w-full rounded-[32px]" key={i} />
            ))}
        >
          <LearnPostGridWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function FloatingNounsBackgroundWrapper() {
  const nouns = await getAllNouns();
  return <FloatingNounsBackground nouns={nouns} forceSmall />;
}

async function LearnPostGridWrapper() {
  const postOverviews = await getPostOverviews();

  return (
    <>
      {postOverviews?.map((overview, i) => (
        <PostOverview data={overview} key={i} />
      ))}
    </>
  );
}

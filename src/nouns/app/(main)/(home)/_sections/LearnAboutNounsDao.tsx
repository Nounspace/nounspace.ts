import PostOverview from "@nouns/components/PostOverview";
import { Button } from "@nouns/components/ui/button";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { getPostOverviews } from "@nouns/data/cms/getPostOverviews";
import Link from "next/link";
import { Suspense } from "react";

export default function LearnAboutNounsDao() {
  return (
    <section className="flex w-full max-w-[1680px] flex-col items-center justify-center gap-8 px-6 md:gap-16 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center md:px-10">
        <h2>Learn about Nouns DAO</h2>
        <div className="max-w-[660px] paragraph-lg">
          All the latest guides, tutorials, and explainers.
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
        <Suspense
          fallback={Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                className="h-[340px] w-full flex-1 rounded-[32px]"
                key={i}
              />
            ))}
        >
          <PostWrapper />
        </Suspense>
      </div>
      <Link href="/learn">
        <Button className="rounded-full">See all posts</Button>
      </Link>
    </section>
  );
}

async function PostWrapper() {
  const postOverviews = await getPostOverviews();
  return (
    <>
      {postOverviews
        ?.slice(0, 3)
        .map((overview, i) => <PostOverview data={overview} key={i} />)}
    </>
  );
}

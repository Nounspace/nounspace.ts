import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { Button } from "@nouns/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { NounsInfiniteScroller } from "@nouns/components/NounsInfiniteScroller";

export default function TheseAreNouns() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 md:gap-12">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center md:px-10">
        <h2>These are Nouns</h2>
        <div className="max-w-[480px] paragraph-lg">
          One new Noun is born each day with randomly generated traits and
          preserved on the blockchain, forever.
        </div>
      </div>
      <Suspense fallback={null}>
        <ScrollerWrapper />
      </Suspense>
      <Link href="/explore">
        <Button className="rounded-full">Explore Nouns</Button>
      </Link>
    </section>
  );
}

async function ScrollerWrapper() {
  const allNouns = await getAllNouns();
  return <NounsInfiniteScroller nouns={allNouns} />;
}

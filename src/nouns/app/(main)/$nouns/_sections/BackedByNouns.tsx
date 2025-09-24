import { NounsInfiniteScroller } from "@nouns/components/NounsInfiniteScroller";
import { Button } from "@nouns/components/ui/button";
import { CHAIN_CONFIG } from "@nouns/config";
import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import Link from "next/link";
import { Suspense } from "react";
import { isAddressEqual } from "viem";

export default function BackedByNouns() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
        <h2>Backed by Nouns</h2>
        <p className="max-w-[480px] text-center paragraph-lg">
          $NOUNS tokens are collateralized by these Nouns:
        </p>
      </div>
      <Suspense fallback={null}>
        <BackedByNounsDataWrapper />
      </Suspense>
      <Link href="/explore?instantSwap=1">
        <Button className="rounded-full">See all</Button>
      </Link>
    </section>
  );
}

async function BackedByNounsDataWrapper() {
  const allNouns = await getAllNouns();
  const instantSwapNouns = allNouns.filter((noun) =>
    isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsErc20),
  );

  return <NounsInfiniteScroller nouns={instantSwapNouns} />;
}

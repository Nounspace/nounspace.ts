import { Suspense } from "react";
import { Skeleton } from "@nouns/components/ui/skeleton";
import ActivityStats from "./ActivityStats";
import Link from "next/link";
import ActivitySelector from "@nouns/components/selectors/ActivitySelector";
import { getActivity } from "@nouns/data/ponder/activity/getActivity";
import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { readContract } from "viem/actions";
import { CHAIN_CONFIG } from "@nouns/config";
import { erc721Abi } from "viem";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";
import IndexerIssues from "@nouns/components/IndexerIssues";

export const metadata: Metadata = {
  alternates: {
    canonical: "./",
  },
};

export default function ActivityPage() {
  return (
    <>
      <div className="flex flex-col justify-between md:flex-row">
        <div>
          <h4>Activity</h4>
          <div>
            Activity around{" "}
            <Link href="/convert" className="underline">
              $nouns ERC-20
            </Link>
            .
          </div>
        </div>
        <div className="flex w-full justify-start gap-2 bg-white py-2 md:w-fit md:justify-end md:self-end md:py-0">
          <Suspense>
            <ActivitySelector />
          </Suspense>
        </div>
      </div>
      <Suspense
        fallback={
          <>
            <div className="flex h-[196px] flex-col gap-4 md:h-[97px] md:flex-row">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    className="w-full flex-1 rounded-2xl md:h-full md:w-auto"
                    key={i}
                  />
                ))}
            </div>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <Skeleton className="h-[48px] rounded-2xl" key={i} />
              ))}
          </>
        }
      >
        <ActivityDataWrapper />
      </Suspense>
    </>
  );
}

async function ActivityDataWrapper() {
  const [activity, allNouns, swappableNounCount] = await Promise.all([
    getActivity(),
    getAllNouns(),
    unstable_cache(
      async () => {
        return Number(
          await readContract(CHAIN_CONFIG.publicClient, {
            abi: erc721Abi,
            address: CHAIN_CONFIG.addresses.nounsToken,
            functionName: "balanceOf",
            args: [CHAIN_CONFIG.addresses.nounsErc20],
          }),
        );
      },
      ["swappable-noun-count"],
      { revalidate: 60 * 15 },
    )(),
  ]);

  if (activity.length == 0 || allNouns.length == 0) {
    return <IndexerIssues />;
  }

  return (
    <ActivityStats
      data={activity}
      nouns={allNouns}
      swappableNounCount={swappableNounCount}
    />
  );
}

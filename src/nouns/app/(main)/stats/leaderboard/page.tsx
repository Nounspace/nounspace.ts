import { Suspense } from "react";
import LeaderboardStats from "./LeaderboardStats";
import { getAccountLeaderboard } from "@nouns/data/ponder/leaderboard/getAccountLeaderboard";
import { getCurrentAuctionNounId } from "@nouns/data/auction/getCurrentAuctionNounId";
import { Skeleton } from "@nouns/components/ui/skeleton";
import { Metadata } from "next";
import IndexerIssues from "@nouns/components/IndexerIssues";

export const metadata: Metadata = {
  alternates: {
    canonical: "./",
  },
};

export default function LeaderboardPage() {
  return (
    <>
      <div>
        <h4>Ownership Leaderboard</h4>
        <div>
          This leaderboard ranks Noun owners based on their combined holdings of
          Nouns NFTs and $nouns tokens.{" "}
        </div>
      </div>
      <Suspense
        fallback={
          <>
            <div className="flex h-[97px] flex-col gap-4 md:flex-row">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton className="h-full flex-1 rounded-2xl" key={i} />
                ))}
            </div>
            <Skeleton className="h-[1500px] rounded-2xl" />
          </>
        }
      >
        <LeaderboardDataWrapper />
      </Suspense>
    </>
  );
}

async function LeaderboardDataWrapper() {
  const [accountLeaderboardData, currentAuctionId] = await Promise.all([
    getAccountLeaderboard(),
    getCurrentAuctionNounId(),
  ]);

  if (accountLeaderboardData.length == 0) {
    return <IndexerIssues />;
  }

  return (
    <LeaderboardStats
      accountLeaderboardData={accountLeaderboardData}
      totalNounsCount={Number(currentAuctionId)}
    />
  );
}

export const revalidate = 43200; // Half day
export const dynamic = "force-static";

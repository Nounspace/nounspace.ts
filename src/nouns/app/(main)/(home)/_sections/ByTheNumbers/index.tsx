import { Suspense } from "react";
import ByTheNumbersData from "./ByTheNumbersData";
import { Button } from "@nouns/components/ui/button";
import Link from "next/link";
import { getCurrentAuctionNounId } from "@nouns/data/auction/getCurrentAuctionNounId";
import { getAccountLeaderboard } from "@nouns/data/ponder/leaderboard/getAccountLeaderboard";
import { getTreasurySummary } from "@nouns/data/ponder/financial/getTreasurySummary";
import { getExecutedProposalsCount } from "@nouns/data/ponder/governance/getExecutedProposalsCount";

export default function ByTheNumbers() {
  return (
    <section className="flex w-full min-w-0 max-w-[1680px] flex-col items-center justify-center gap-8 px-6 md:gap-16 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center md:px-10">
        <h2>Nouns by the Numbers</h2>
        <div className="max-w-[480px] paragraph-lg">
          Nouns empower creativity and subcultures, with millions in funding
          distributed to hundreds of ideas, all governed by Noun holders.
        </div>
      </div>
      <Suspense fallback={null}>
        <ByTheNumbersDataWrapper />
      </Suspense>
      <Link href="/stats">
        <Button className="rounded-full">Explore Stats</Button>
      </Link>
    </section>
  );
}

async function ByTheNumbersDataWrapper() {
  const [currentAuctionId, leaderboard, treasurySummary, ideasFunded] =
    await Promise.all([
      getCurrentAuctionNounId(),
      getAccountLeaderboard(),
      getTreasurySummary(),
      getExecutedProposalsCount(),
    ]);

  return (
    <ByTheNumbersData
      nounsCreated={Number(currentAuctionId) + 1}
      nounOwners={leaderboard?.length ?? 0}
      ideasFunded={ideasFunded}
      treasuryDeployedUsd={treasurySummary.propSpendInUsd}
    />
  );
}

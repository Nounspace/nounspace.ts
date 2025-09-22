import { LinkExternal } from "@nouns/components/ui/link";
import { CHAIN_CONFIG } from "@nouns/config";
import TimeSelector from "@nouns/components/selectors/TimeSelector";
import CurrencySelector from "@nouns/components/selectors/CurrencySelector";
import { getDailyFinancialSnapshots } from "@nouns/data/ponder/financial/getDailyFinancialSnapshots";
import { Suspense } from "react";
import { Skeleton } from "@nouns/components/ui/skeleton";
import TreasuryStats from "./TreasuryStats";
import { Metadata } from "next";
import IndexerIssues from "@nouns/components/IndexerIssues";

export const metadata: Metadata = {
  alternates: {
    canonical: "./",
  },
};

export default function TreasuryPage() {
  return (
    <>
      <div className="flex flex-col justify-between md:flex-row">
        <div>
          <h4>Treasury Stats</h4>
          <span>
            Data and insights for the{" "}
            <LinkExternal
              href={
                CHAIN_CONFIG.chain.blockExplorers?.default.url +
                `/tokenholdings?a=${CHAIN_CONFIG.addresses.nounsTreasury}`
              }
              className="underline"
            >
              Nouns treasury
            </LinkExternal>
            .
          </span>
        </div>
        <div className="flex w-full justify-start gap-2 bg-white py-2 md:w-fit md:justify-end md:self-end md:py-0">
          <Suspense>
            <CurrencySelector />
            <TimeSelector />
          </Suspense>
        </div>
      </div>
      <Suspense
        fallback={
          <>
            <div className="flex h-[97px] flex-col gap-4 md:flex-row">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton className="h-full flex-1 rounded-2xl" key={i} />
                ))}
            </div>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton className="h-[341px] rounded-2xl" key={i} />
              ))}
          </>
        }
      >
        <TreasuryDataWrapper />
      </Suspense>
    </>
  );
}

async function TreasuryDataWrapper() {
  const data = await getDailyFinancialSnapshots();

  if (data.length == 0) {
    return <IndexerIssues />;
  }

  return <TreasuryStats data={data} />;
}

export const revalidate = 43200; // Half day
export const dynamic = "force-static";

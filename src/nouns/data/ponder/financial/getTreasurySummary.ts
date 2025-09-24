import { unstable_cache } from "next/cache";
import { getDailyFinancialSnapshots } from "./getDailyFinancialSnapshots";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";

interface TreasurySummary {
  treasuryBalanceInUsd: number;
  treasuryBalanceInEth: number;

  auctionRevenueInUsd: number;
  auctionRevenueInEth: number;

  propSpendInUsd: number;
  propSpendInEth: number;
}

async function getTreasurySummaryUncached(): Promise<TreasurySummary> {
  const data = await getDailyFinancialSnapshots();
  const lastEntry = data[data.length - 1];

  const treasuryBalanceInEth = Number(lastEntry.treasuryBalanceInEth);
  const treasuryBalanceInUsd = Number(lastEntry.treasuryBalanceInUsd);

  let auctionRevenueInUsd = 0;
  let auctionRevenueInEth = 0;
  let propSpendInUsd = 0;
  let propSpendInEth = 0;

  for (const entry of data) {
    auctionRevenueInUsd += Number(entry.auctionRevenueInUsd);
    auctionRevenueInEth += Number(entry.auctionRevenueInEth);
    propSpendInUsd += Number(entry.propSpendInUsd);
    propSpendInEth += Number(entry.propSpendInEth);
  }

  return {
    treasuryBalanceInEth,
    treasuryBalanceInUsd,
    auctionRevenueInEth,
    auctionRevenueInUsd,
    propSpendInEth,
    propSpendInUsd,
  };
}

export const getTreasurySummary = unstable_cache(
  getTreasurySummaryUncached,
  ["get-treasury-summary"],
  { revalidate: SECONDS_PER_DAY / 2 },
);

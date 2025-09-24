"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { getCurrentAuctionNounId } from "@nouns/data/auction/getCurrentAuctionNounId";
import { getNounById } from "@nouns/data/noun/getNounById";
import { getAuctionById } from "@nouns/data/auction/getAuctionById";
import { formatEther, formatUnits } from "viem";
import { getEthPriceUsd } from "@nouns/data/tokens/getEthPriceUsd";

const query = graphql(/* GraphQL */ `
  query NounsErc20Volume($dayTimestamp: Int!) {
    nounsErc20DailyVolumes(
      where: { dayTimestamp_gt: $dayTimestamp }
      limit: 1000
    ) {
      items {
        dayTimestamp
        baseVolume
        mainnetVolume
      }
    }
  }
`);

export async function getNounsErc20VolumeUsd() {
  const dayTimestamp = Math.floor(Date.now() / 1000 - 30 * SECONDS_PER_DAY);

  const data = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    { dayTimestamp },
    {
      next: {
        revalidate: SECONDS_PER_DAY,
      },
    },
  );

  if (!data) {
    return 0;
  }

  const totalVolume = (data as any).nounsErc20DailyVolumes.items.reduce((acc, item) => {
    return acc + BigInt(item.mainnetVolume) + BigInt(item.baseVolume);
  }, BigInt(0));

  const [currentNounId, ethPriceUsd] = await Promise.all([
    getCurrentAuctionNounId(),
    getEthPriceUsd(),
  ]);

  const prevAuctionNounId =
    Number(currentNounId) % 10 == 0
      ? Number(currentNounId) - 2
      : Number(currentNounId) - 1;
  const prevAuction = await getAuctionById(prevAuctionNounId.toString());
  const prevAuctionWinningBid = BigInt(prevAuction?.bids[0]?.amount ?? "0");

  return (
    (Number(formatUnits(totalVolume, 18)) / 1000000) * // # of Nouns equivalent
    Number(formatEther(prevAuctionWinningBid)) * // Price of Noun in ETH
    ethPriceUsd
  );
}

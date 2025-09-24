import { CHAIN_CONFIG } from "@nouns/config";
import { multicall } from "viem/actions";
import { nounsAuctionHouseConfig, nounsDaoLogicConfig } from "../generated/wagmi";
import { unstable_cache } from "next/cache";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { BigIntString } from "@nouns/utils/types";

interface ProtocolParams {
  reservePrice: BigIntString;
  minBidIncrementPercentage: number;
  proposalThreshold: BigIntString;
}

async function getProtocolParamsUncached(): Promise<ProtocolParams> {
  const [reservePrice, minBidIncrementPercentage, proposalThreshold] = await multicall(CHAIN_CONFIG.publicClient, {
    contracts: [
      { ...nounsAuctionHouseConfig, functionName: "reservePrice" },
      { ...nounsAuctionHouseConfig, functionName: "minBidIncrementPercentage" },
      { ...nounsDaoLogicConfig, functionName: "proposalThreshold" },
    ],
    allowFailure: false,
  });

  return {
    reservePrice: reservePrice.toString(),
    minBidIncrementPercentage,
    proposalThreshold: proposalThreshold.toString(),
  };
}

export const getProtocolParams = unstable_cache(
  getProtocolParamsUncached,
  ["get-protocol-params", CHAIN_CONFIG.chain.id.toString()],
  {
    revalidate: SECONDS_PER_DAY,
  }
);

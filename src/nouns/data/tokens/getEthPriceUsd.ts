import { chainlinkPriceFeedAbi } from "@nouns/abis/chainlinkPriceFeed";
import { mainnetPublicClient } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { unstable_cache } from "next/cache";
import { formatUnits, getAddress } from "viem";
import { readContract } from "viem/actions";

const ETH_USD_PRICE_FEED_ADDRESS = getAddress(
  "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
);

const PRICE_FEED_ANSWER_DECIMALS = 8;

async function getEthPriceUsdUncached() {
  mainnetPublicClient;

  const [, answer] = await readContract(mainnetPublicClient, {
    abi: chainlinkPriceFeedAbi,
    address: ETH_USD_PRICE_FEED_ADDRESS,
    functionName: "latestRoundData",
  });

  return Number(formatUnits(answer, PRICE_FEED_ANSWER_DECIMALS));
}

export const getEthPriceUsd = unstable_cache(
  getEthPriceUsdUncached,
  ["get-eth-price-usd"],
  { revalidate: SECONDS_PER_DAY },
);

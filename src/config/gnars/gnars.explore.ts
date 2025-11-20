import { createExplorePageConfig } from "../createExplorePageConfig";
import { gnarsCommunity } from "./gnars.community";

const gnarsTokens = [
  ...(gnarsCommunity.tokens?.erc20Tokens ?? []).map(({ address, symbol, network }) => ({
    address,
    symbol,
    network,
    assetType: "token" as const,
  })),
  ...(gnarsCommunity.tokens?.nftTokens ?? []).map(({ address, symbol, network }) => ({
    address,
    symbol,
    network,
    assetType: "nft" as const,
  })),
];

export const gnarsExplorePage = createExplorePageConfig({
  tokens: gnarsTokens,
  channel: gnarsCommunity.social?.farcaster ?? null,
  defaultTokenNetwork: "base",
  channelNetwork: "base",
});

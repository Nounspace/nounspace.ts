import { createExplorePageConfig } from "../createExplorePageConfig";
import { nounsCommunity } from "./nouns.community";

const nounsTokens = Object.values(nounsCommunity.tokens ?? {});

export const nounsExplorePage = createExplorePageConfig({
  tokens: nounsTokens.map(({ address, symbol }) => ({ address, symbol })),
  channel: nounsCommunity.social?.farcaster ?? null,
  defaultTokenNetwork: "mainnet",
});

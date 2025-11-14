import { createExplorePageConfig } from "../createExplorePageConfig";
import { exampleCommunity } from "./example.community";

const exampleTokens = Object.values(exampleCommunity.tokens ?? {});

export const exampleExplorePage = createExplorePageConfig({
  tokens: exampleTokens.map(({ address, symbol }) => ({ address, symbol })),
  channel: exampleCommunity.social?.farcaster ?? null,
  defaultTokenNetwork: "mainnet",
});

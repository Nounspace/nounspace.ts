import { createExplorePageConfig } from "../createExplorePageConfig";
import { clankerCommunity } from "./clanker.community";

const clankerTokens = Object.values(clankerCommunity.tokens ?? {});

export const clankerExplorePage = createExplorePageConfig({
  tokens: clankerTokens.map(({ address, symbol }) => ({ address, symbol })),
  channel: clankerCommunity.social?.farcaster ?? null,
  defaultTokenNetwork: "base",
  channelNetwork: "base",
});

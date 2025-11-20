import { Address } from "viem";
import type {
  CommunityConfig,
  CommunityErc20Token,
  CommunityNftToken,
} from "../systemConfig";

export const gnarsCommunity = {
  type: "nouns_fork",
  urls: {
    website: "https://gnars-shadcn.vercel.app/",
    discord: "https://discord.gg/gnars",
    twitter: "https://twitter.com/GnarsDAO",
    github: "https://github.com/gnarsdao",
    forum: "https://nouns.center/dao/gnars",
  },
  social: {
    farcaster: "gnars",
    discord: "gnars",
    twitter: "GnarsDAO",
  },
  governance: {
    proposals: "https://nouns.center/dao/gnars/proposals",
    delegates: "https://nouns.center/dao/gnars/delegates",
    treasury: "https://nouns.center/dao/gnars/treasury",
  },
  tokens: {
    erc20Tokens: [
      {
        address: "0x0cf0c3b75d522290d7d12c74d7f1f0cc47ccb23b",
        symbol: "$GNARS",
        decimals: 18,
        network: "base",
      },
    ] satisfies CommunityErc20Token[],
    nftTokens: [
      {
        address: "0x880Fb3Cf5c6Cc2d7DFC13a993E839a9411200C17",
        symbol: "Gnars",
        type: "erc721",
        network: "base",
      },
    ] satisfies CommunityNftToken[],
  },
  contracts: {
    nouns: "0x880Fb3Cf5c6Cc2d7DFC13a993E839a9411200C17" as Address,
    auctionHouse: "0x0000000000000000000000000000000000000000" as Address,
    nogs: "0x0000000000000000000000000000000000000000" as Address,
    space: "0x0000000000000000000000000000000000000000" as Address,
    erc20: "0x0cf0c3b75d522290d7d12c74d7f1f0cc47ccb23b" as Address,
  },
} satisfies CommunityConfig;

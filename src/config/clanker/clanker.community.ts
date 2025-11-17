import { Address } from "viem";

export const clankerCommunity = {
  type: "token_platform",
  urls: {
    website: "https://clanker.world",
    discord: "https://discord.gg/clanker", // Placeholder - would need actual Discord
    twitter: "https://twitter.com/clankerworld", // Placeholder - would need actual Twitter
    github: "https://github.com/clanker", // Placeholder - would need actual GitHub
    forum: "https://forum.clanker.world" // Placeholder - would need actual forum
  },
  social: {
    farcaster: "clanker", // Placeholder - would need actual Farcaster handle
    discord: "clanker", // Placeholder - would need actual Discord
    twitter: "clankerworld" // Placeholder - would need actual Twitter handle
  },
  governance: {
    proposals: "https://proposals.clanker.world", // Placeholder
    delegates: "https://delegates.clanker.world", // Placeholder
    treasury: "https://treasury.clanker.world" // Placeholder
  },
  tokens: {
    clanker: {
      address: "0x0000000000000000000000000000000000000000", // Placeholder - would need actual token address
      symbol: "CLANKER",
      decimals: 18
    },
    clankerToken: {
      address: "0x0000000000000000000000000000000000000000", // Placeholder - would need actual token address
      symbol: "CLANKER",
      decimals: 18
    }
  },
  contracts: {
    clanker: "0x0000000000000000000000000000000000000000" as Address, // Placeholder - would need actual contract
    tokenFactory: "0x0000000000000000000000000000000000000000" as Address, // Placeholder - would need actual contract
    space: "0x0000000000000000000000000000000000000000" as Address, // Placeholder - would need actual contract
    trading: "0x0000000000000000000000000000000000000000" as Address, // Placeholder - would need actual contract
    // For compatibility with CommunityConfig interface
    nouns: "0x0000000000000000000000000000000000000000" as Address,
    auctionHouse: "0x0000000000000000000000000000000000000000" as Address,
    nogs: "0x0000000000000000000000000000000000000000" as Address,
  }
};

import { Address } from "viem";

export const nounsCommunity = {
  type: 'nouns',
  urls: {
    website: 'https://nouns.com',
    discord: 'https://discord.gg/nouns',
    twitter: 'https://twitter.com/nounsdao',
    github: 'https://github.com/nounsDAO',
    forum: 'https://discourse.nouns.wtf',
  },
  social: {
    farcaster: 'nouns',
    discord: 'nouns',
    twitter: 'nounsdao',
  },
  governance: {
    proposals: 'https://nouns.wtf/vote',
    delegates: 'https://nouns.wtf/delegates',
    treasury: 'https://nouns.wtf/treasury',
  },
  tokens: {
    noun: {
      address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
      symbol: 'NOUN',
      decimals: 0,
    },
    nounsToken: {
      address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
      symbol: '$NOUNS',
      decimals: 18,
    },
  },
  contracts: {
    nouns: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03' as Address,
    auctionHouse: '0x830bd73e4184cef73443c15111a1df14e495c706' as Address,
    space: '0x1234567890123456789012345678901234567890' as Address, // Placeholder
    nogs: '0x1234567890123456789012345678901234567890' as Address, // Placeholder
  },
};
"use client";
import { ReactNode } from "react";
import { WhiskSdkProvider as _WhiskSdkProvider } from "@paperclip-labs/whisk-sdk";
import { getAddress } from "viem";
import { CHAIN_CONFIG } from "@nouns/config";
import { IdentityResolver } from "@paperclip-labs/whisk-sdk/identity";

export default function WhiskSdkProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <_WhiskSdkProvider
      apiKey={process.env.NEXT_PUBLIC_WHISK_API_KEY!}
      config={{
        identity: {
          resolverOrder: [
            IdentityResolver.Nns,
            IdentityResolver.Ens,
            IdentityResolver.Farcaster,
            IdentityResolver.Lens,
            IdentityResolver.Base,
            IdentityResolver.Uni,
            IdentityResolver.World,
          ],
          overrides: {
            [getAddress(CHAIN_CONFIG.addresses.nounsTreasury)]: {
              name: "The Nouns Treasury",
              avatar: "/nouns-treasury.png",
            },
            [getAddress(CHAIN_CONFIG.addresses.nounsErc20)]: {
              name: "$nouns ERC-20 contract",
              avatar: "/nouns-erc20.png",
            },
            [getAddress(CHAIN_CONFIG.addresses.nounsAuctionHouseProxy)]: {
              name: "Nouns Auction House",
              avatar: "/auction-house.png",
            },
            [getAddress(CHAIN_CONFIG.addresses.nounsToken)]: {
              name: "Nouns NFT",
              avatar: "/nouns-treasury.png",
            },
            [getAddress(CHAIN_CONFIG.addresses.nounsPayer)]: {
              name: "Nouns Payer",
              avatar: "/nouns-treasury.png",
            },
          },
        },
      }}
    >
      {children}
    </_WhiskSdkProvider>
  );
}

"use client";
import React from "react";
import { Chain, Transport } from "viem";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import type { CreateConfigParameters } from "wagmi";
import {
  baseHttp,
  mainnetHttp,
  optimismHttp,
} from "@/constants/alchemyChainUrls";
import { base, mainnet, optimism } from "viem/chains";

const wagmiParams: CreateConfigParameters<
  readonly [Chain, ...Chain[]],
  Record<number, Transport>
> = {
  chains: [optimism, mainnet, base],
  transports: {
    [optimism.id]: optimismHttp,
    [mainnet.id]: mainnetHttp,
    [base.id]: baseHttp,
  },
};

const wagmiConfig = createConfig(wagmiParams);
export { wagmiConfig };

export default function Wagmi({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}

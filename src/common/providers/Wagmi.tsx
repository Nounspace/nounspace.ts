"use client";
import React from "react";
import { Chain, Transport, http } from "viem";
import { createConfig } from "wagmi";
import { WagmiProvider } from "@privy-io/wagmi";
import type { CreateConfigParameters } from "wagmi";
import {
  baseHttp,
  mainnetHttp,
  optimismHttp,
} from "@/constants/alchemyChainUrls";
import { base, mainnet, optimism } from "viem/chains";

// Create fallback transports when Alchemy API key is not available
const createTransports = () => {
  try {
    // Try to use Alchemy transports if API key is available
    if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      return {
        [optimism.id]: optimismHttp,
        [mainnet.id]: mainnetHttp,
        [base.id]: baseHttp,
      };
    }
  } catch (error) {
    console.warn("Alchemy transports not available, using fallback");
  }
  
  // Fallback to public RPC endpoints
  return {
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
  };
};

const wagmiParams: CreateConfigParameters<
  readonly [Chain, ...Chain[]],
  Record<number, Transport>
> = {
  chains: [optimism, mainnet, base],
  transports: createTransports(),
};

const wagmiConfig = createConfig(wagmiParams);
export { wagmiConfig };

export default function Wagmi({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}

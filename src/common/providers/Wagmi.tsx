import React from "react";
import { Chain, Transport } from "viem";
import { createConfig } from "wagmi";
import { WagmiProvider } from '@privy-io/wagmi';
import type { CreateConfigParameters } from "wagmi";
import { mainnetHttp, optimismHttp } from "@/constants/chains";
import { mainnet, optimism } from "viem/chains";

const wagmiParams: CreateConfigParameters<readonly [Chain, ...Chain[]], Record<number, Transport>> = {
  chains: [optimism, mainnet],
  transports: {
    [optimism.id]: optimismHttp,
    [mainnet.id]: mainnetHttp,
  },
};

const wagmiConfig = createConfig(wagmiParams);

export default function Wagmi({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      { children }
    </WagmiProvider>
  )
}
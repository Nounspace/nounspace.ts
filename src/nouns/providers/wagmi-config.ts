import { createConfig, fallback, http } from "wagmi";
import { mainnet } from "wagmi/chains";

import { getDefaultConfig } from "../mocks/connectkit";
import { CHAIN_CONFIG } from "@nouns/config";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [mainnet],
    transports: {
      [CHAIN_CONFIG.publicClient.chain!.id]: fallback([
        http(CHAIN_CONFIG.rpcUrl.primary),
        http(CHAIN_CONFIG.rpcUrl.fallback),
      ]),
    },

    walletConnectProjectId: "cb75b98c5532821d721e6275da3e7006",

    appName: "Nouns.com",
    appDescription: "Bid, explore, and swap Nouns.",

    appUrl: process.env.NEXT_PUBLIC_URL!,
    appIcon: `${process.env.NEXT_PUBLIC_URL}/app-icon.jpeg`,

    ssr: true,
  }),
);

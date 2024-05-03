import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, midnightTheme } from "@rainbow-me/rainbowkit";
import { optimism, mainnet } from "@wagmi/core/chains";
import { http, createConfig } from "@wagmi/core";
import { Chain, Transport, createPublicClient } from "viem";
import { CreateConfigParameters } from "wagmi";

const optimismHttp = http(
  `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

const mainnetHttp = http(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

const wagmiParams: CreateConfigParameters<readonly [Chain, ...Chain[]], Record<number, Transport>> = {
  chains: [optimism, mainnet],
  transports: {
    [optimism.id]: optimismHttp,
    [mainnet.id]: mainnetHttp,
  },
};

export const wagmiConfig = createConfig(wagmiParams);

export const publicClient = createPublicClient({
  chain: optimism,
  transport: optimismHttp,
});

export const config = getDefaultConfig({
  ...wagmiParams,
  appName: process.env.NEXT_PUBLIC_APP_NAME!,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  ssr: true,
});

export const rainbowKitTheme = midnightTheme({
  accentColorForeground: "white",
  borderRadius: "small",
  fontStack: "system",
});

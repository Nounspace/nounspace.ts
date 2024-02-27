import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, midnightTheme } from "@rainbow-me/rainbowkit";
import { optimism, mainnet } from "@wagmi/core/chains";
import { http, createConfig } from "@wagmi/core";
import { createPublicClient } from "viem";

const optimismHttp = http(
  `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

const mainnetHttp = http(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

export const wagmiConfig = createConfig({
  chains: [optimism, mainnet],
  transports: {
    [optimism.id]: optimismHttp,
    [mainnet.id]: mainnetHttp,
  },
});

export const publicClient = createPublicClient({
  chain: optimism,
  transport: optimismHttp,
});

export const config = getDefaultConfig({
  appName: "herocast",
  projectId: "b34f1019e33e832831871e41741f13fc",
  chains: [optimism],
});

export const rainbowKitTheme = midnightTheme({
  accentColorForeground: "white",
  borderRadius: "small",
  fontStack: "system",
});

import { http } from "viem";
import { createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { walletConnect } from "wagmi/connectors";
import { NOUNS_CHAIN_ID } from "./config";

const walletConnectProjectId =
  process.env.NOUNS_WC_PROJECT_ID ||
  process.env.NEXT_PUBLIC_NOUNS_WC_PROJECT_ID ||
  "";

const connectors = [
  injected(),
  ...(walletConnectProjectId
    ? [walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
    })]
    : []),
];

const transports = {
  [mainnet.id]: http(
    process.env.NOUNS_RPC_URL ||
      process.env.NEXT_PUBLIC_NOUNS_RPC_URL ||
      "https://cloudflare-eth.com",
  ),
};

export const nounsWagmiConfig = createConfig({
  chains: [mainnet],
  connectors,
  transports,
  ssr: true,
});

export const REQUIRED_CHAIN_ID = 1 as const;

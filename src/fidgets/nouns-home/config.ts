import { http, type Transport } from "viem";
import { mainnet } from "viem/chains";
import { createPublicClient } from "viem";

const FALLBACK_RPC = "https://cloudflare-eth.com";

const getEnv = (key: string) =>
  typeof process !== "undefined"
    ? (process.env?.[key] as string | undefined)
    : undefined;

const rpcUrl =
  getEnv("NOUNS_RPC_URL") ||
  getEnv("NEXT_PUBLIC_NOUNS_RPC_URL") ||
  FALLBACK_RPC;

const chainIdRaw =
  getEnv("NOUNS_CHAIN_ID") || getEnv("NEXT_PUBLIC_NOUNS_CHAIN_ID") || "1";

export const NOUNS_CHAIN_ID = Number(chainIdRaw) || 1;

export const NOUNS_AH_ADDRESS =
  (getEnv("NOUNS_AH_ADDRESS") || getEnv("NEXT_PUBLIC_NOUNS_AH_ADDRESS") ||
    "0x830bd73e4184cef73443c15111a1df14e495c706") as `0x${string}`;

export const NOUNS_TOKEN_ADDRESS =
  (getEnv("NOUNS_TOKEN_ADDRESS") ||
    getEnv("NEXT_PUBLIC_NOUNS_TOKEN_ADDRESS") ||
    "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03") as `0x${string}`;

export type NounsImageSource = "tokenURI" | "noun.pics" | "cloudnouns";

export const NOUNS_IMAGE_SOURCE = (
  (getEnv("NOUNS_IMAGE_SOURCE") ||
    getEnv("NEXT_PUBLIC_NOUNS_IMAGE_SOURCE") ||
    "tokenURI") as NounsImageSource
).toLowerCase() as NounsImageSource;

const nounsTransport: Transport = http(rpcUrl, { timeout: 15_000 });

export const nounsPublicClient = createPublicClient({
  chain: mainnet,
  transport: nounsTransport,
  batch: { multicall: { wait: 32, batchSize: 512 } },
});

export const nounsClientSupportsDevRpc = rpcUrl !== FALLBACK_RPC;

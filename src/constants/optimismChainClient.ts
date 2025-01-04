import { createPublicClient } from "viem";
import { optimism } from "viem/chains";
import { optimismHttp } from "./alchemyChainUrls";

export const optimismChaninClient = createPublicClient({
  chain: optimism,
  transport: optimismHttp,
});

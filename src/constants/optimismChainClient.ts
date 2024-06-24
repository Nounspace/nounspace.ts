import { createPublicClient } from "viem";
import { optimism } from "viem/chains";
import { optimismHttp } from "./chains";

export const publicClient = createPublicClient({
  chain: optimism,
  transport: optimismHttp,
});

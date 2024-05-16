import { optimism } from "@wagmi/core/chains";
import {  createPublicClient } from "viem";
import { optimismHttp } from "@/constants/chains";

export const publicClient = createPublicClient({
  chain: optimism,
  transport: optimismHttp,
});
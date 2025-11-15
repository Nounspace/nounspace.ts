import type { Address } from "viem";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import {
  getEnsName as wagmiGetEnsName,
  getEnsAvatar as wagmiGetEnsAvatar,
} from "wagmi/actions";
import { http } from "@wagmi/core";
import neynar from "@/common/data/api/neynar";
import { ALCHEMY_API } from "@/constants/urls";
import type { DirectoryDependencies } from "./types";

let ensLookupConfig: ReturnType<typeof createConfig> | null = null;

function getEnsLookupConfig() {
  if (!ensLookupConfig) {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not configured");
    }

    ensLookupConfig = createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(`${ALCHEMY_API("eth")}v2/${apiKey}`),
      },
    });
  }

  return ensLookupConfig;
}

export const defaultDependencies: DirectoryDependencies = {
  fetchFn: fetch,
  neynarClient: neynar,
  getEnsNameFn: (address: Address) => wagmiGetEnsName(getEnsLookupConfig(), { address }),
  getEnsAvatarFn: (name: string) => wagmiGetEnsAvatar(getEnsLookupConfig(), { name }),
};


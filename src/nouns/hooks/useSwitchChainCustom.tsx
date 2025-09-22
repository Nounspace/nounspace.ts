"use client";
import { useCallback } from "react";
import { useSwitchChain } from "wagmi";
import { CHAIN_CONFIG } from "@nouns/config";
import { useModal } from "connectkit";

export function useSwitchChainCustom(): {
  switchChain: ({ chainId }: { chainId: number }) => Promise<boolean>;
} {
  const { switchChainAsync } = useSwitchChain();
  const { openSwitchNetworks} = useModal();

  const switchChain = useCallback(
    async ({ chainId }: { chainId: number }) => {
      try {
        // Try to automatically switch
        const { id } = await switchChainAsync({ chainId });
        if (id != CHAIN_CONFIG.chain.id) {
          throw "Didn't switch network, likely injected..";
        }
        return true;
      } catch (e) {
        // If that doesn't work open the modal
        console.error("Error switching chains, disconnecting...", e);
        openSwitchNetworks();
        return false;
      }
    },
    [switchChainAsync, openSwitchNetworks]
  );

  return { switchChain };
}

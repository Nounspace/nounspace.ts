"use client";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";
import { nounsErc20TokenConfig, nounsNftTokenConfig } from "@nouns/data/generated/wagmi";
import { encodeFunctionData, isAddressEqual } from "viem";
import { CustomTransactionValidationError } from "./types";
import { multicall } from "viem/actions";
import { useAccount } from "wagmi";
import { CHAIN_CONFIG } from "@nouns/config";
import { useCallback } from "react";

interface UseNounsErc20SwapReturnType extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  swap: (fromNounId: bigint, toNounId: bigint) => void;
}

export function useNounsErc20Swap(): UseNounsErc20SwapReturnType {
  const { sendTransaction, ...other } = useSendTransaction();
  const { address } = useAccount();

  const swapValidation = useCallback(
    async (fromNounId: bigint, toNounId: bigint): Promise<CustomTransactionValidationError | null> => {
      const [fromNounOwner, toNounOwner, currentApprovalAddress] = await multicall(CHAIN_CONFIG.publicClient, {
        contracts: [
          { ...nounsNftTokenConfig, functionName: "ownerOf", args: [fromNounId] },
          { ...nounsNftTokenConfig, functionName: "ownerOf", args: [toNounId] },
          { ...nounsNftTokenConfig, functionName: "getApproved", args: [fromNounId] },
        ],
        allowFailure: false,
      });

      if (!address) {
        // Never should get here, since sendTransaction enforces connected
        return new CustomTransactionValidationError("NOT_CONNECTED", "Wallet not connected.");
      } else if (!isAddressEqual(fromNounOwner, address)) {
        return new CustomTransactionValidationError("SENDER_NOT_OWNER", "Sender no longer owns the swap input Noun.");
      } else if (!isAddressEqual(toNounOwner, CHAIN_CONFIG.addresses.nounsErc20)) {
        return new CustomTransactionValidationError(
          "NOUNS_ERC20_NOT_OWNER",
          "The Nouns ERC-20 contract no longer owns the swap output Noun."
        );
      } else if (!isAddressEqual(currentApprovalAddress, CHAIN_CONFIG.addresses.nounsErc20)) {
        return new CustomTransactionValidationError(
          "MISSING_APPROVAL",
          "Nouns ERC-20 contract is not approved for the swap input Noun."
        );
      }

      return null;
    },
    [address]
  );

  const swap = useCallback(
    async (fromNounId: bigint, toNounId: bigint) => {
      const request = {
        to: nounsErc20TokenConfig.address,
        data: encodeFunctionData({
          abi: nounsErc20TokenConfig.abi,
          functionName: "swap",
          args: [[fromNounId], [toNounId]],
        }),
        value: BigInt(0),
        gasFallback: BigInt(300000), // Swap generally ~200k
      };

      return sendTransaction(
        request,
        { type: "nouns-swap", description: `Swap Noun ${fromNounId} for ${toNounId}` },
        () => swapValidation(fromNounId, toNounId)
      );
    },
    [sendTransaction, swapValidation]
  );

  return { swap, ...other };
}

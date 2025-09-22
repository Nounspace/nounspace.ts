"use client";
import { encodeFunctionData, isAddressEqual } from "viem";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";
import { useCallback } from "react";
import { nounsErc20TokenConfig, nounsNftTokenConfig } from "@nouns/data/generated/wagmi";
import { CustomTransactionValidationError } from "./types";
import { useAccount } from "wagmi";
import { multicall } from "viem/actions";
import { CHAIN_CONFIG } from "@nouns/config";

interface UseNounsErc20DepositReturnType extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  deposit: (nounId: bigint) => void;
}

export function useNounsErc20Deposit(): UseNounsErc20DepositReturnType {
  const { sendTransaction, ...other } = useSendTransaction();
  const { address } = useAccount();

  const depositValidation = useCallback(
    async (nounId: bigint): Promise<CustomTransactionValidationError | null> => {
      const [nounOwner, currentApprovalAddress] = await multicall(CHAIN_CONFIG.publicClient, {
        contracts: [
          { ...nounsNftTokenConfig, functionName: "ownerOf", args: [nounId] },
          { ...nounsNftTokenConfig, functionName: "getApproved", args: [nounId] },
        ],
        allowFailure: false,
      });

      if (!address) {
        // Never should get here, since sendTransaction enforces connected
        return new CustomTransactionValidationError("NOT_CONNECTED", "Wallet not connected.");
      } else if (!isAddressEqual(nounOwner, address)) {
        return new CustomTransactionValidationError("SENDER_NOT_OWNER", "Sender does not own the Noun.");
      } else if (!isAddressEqual(currentApprovalAddress, CHAIN_CONFIG.addresses.nounsErc20)) {
        return new CustomTransactionValidationError(
          "MISSING_APPROVAL",
          "Nouns ERC-20 contract is not approved for the swap Noun."
        );
      }

      return null;
    },
    [address]
  );

  const deposit = useCallback(
    (nounId: bigint) => {
      const request = {
        to: nounsErc20TokenConfig.address,
        data: encodeFunctionData({
          abi: nounsErc20TokenConfig.abi,
          functionName: "deposit",
          args: [[nounId]],
        }),
        value: BigInt(0),
        gasFallback: BigInt(400000), // Deposit generally ~300k
      };

      return sendTransaction(request, { type: "nouns-deposit", description: `Deposit Noun ${nounId}` }, () =>
        depositValidation(nounId)
      );
    },
    [sendTransaction, depositValidation]
  );

  return { deposit, ...other };
}

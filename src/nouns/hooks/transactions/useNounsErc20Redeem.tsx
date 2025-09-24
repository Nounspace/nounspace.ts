"use client";
import { encodeFunctionData, isAddressEqual, zeroAddress } from "viem";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";
import { useCallback } from "react";
import { nounsErc20TokenConfig, nounsNftTokenConfig } from "@nouns/data/generated/wagmi";
import { CustomTransactionValidationError } from "./types";
import { useAccount } from "wagmi";
import { multicall } from "viem/actions";
import { CHAIN_CONFIG } from "@nouns/config";

const NOUN_TO_ERC20_EXCHANGE_RATE = BigInt(1e6 * 10 ** 18);

interface UseNounsErc20RedeemProps extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  redeem: (nounId: bigint) => void;
}

export function useNounsErc20Redeem(): UseNounsErc20RedeemProps {
  const { sendTransaction, ...other } = useSendTransaction();
  const { address } = useAccount();

  const redeemValidation = useCallback(
    async (nounId: bigint): Promise<CustomTransactionValidationError | null> => {
      const [nounOwner, erc20Balance] = await multicall(CHAIN_CONFIG.publicClient, {
        contracts: [
          { ...nounsNftTokenConfig, functionName: "ownerOf", args: [nounId] },
          { ...nounsErc20TokenConfig, functionName: "balanceOf", args: [address ?? zeroAddress] },
        ],
        allowFailure: false,
      });

      if (!address) {
        // Never should get here, since sendTransaction enforces connected
        return new CustomTransactionValidationError("NOT_CONNECTED", "Wallet not connected.");
      } else if (erc20Balance < NOUN_TO_ERC20_EXCHANGE_RATE) {
        return new CustomTransactionValidationError("INSUFFICIENT BALANCE", "You need 1M $nouns to redeem.");
      } else if (!isAddressEqual(nounOwner, CHAIN_CONFIG.addresses.nounsErc20)) {
        return new CustomTransactionValidationError(
          "NOUNS_ERC20_NOT_OWNER",
          "The Nouns ERC-20 contract no longer owns this Noun."
        );
      }

      return null;
    },
    [address]
  );

  const redeem = useCallback(
    (nounId: bigint) => {
      const request = {
        to: nounsErc20TokenConfig.address,
        data: encodeFunctionData({
          abi: nounsErc20TokenConfig.abi,
          functionName: "redeem",
          args: [[nounId]],
        }),
        value: BigInt(0),
        gasFallback: BigInt(400000), // Deposit generally ~300k
      };

      return sendTransaction(request, { type: "nouns-redeem", description: `Redeem $nouns` }, () =>
        redeemValidation(nounId)
      );
    },
    [sendTransaction, redeemValidation]
  );

  return { redeem, ...other };
}

"use client";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";
import { useCallback } from "react";

interface UseApproveErc20ReturnType extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  approveErc20: (tokenAddress: Address, spender: Address, amount: bigint) => void;
}

export function useApproveErc20(): UseApproveErc20ReturnType {
  const { sendTransaction, ...other } = useSendTransaction();

  const approveErc20 = useCallback(
    (tokenAddress: Address, spender: Address, amount: bigint) => {
      const request = {
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount],
        }),
        value: BigInt(0),
        gasFallback: BigInt(80000), // WETH approve generally ~50k
      };

      return sendTransaction(request, {
        type: "approve-erc20",
        description: `Approve ERC-20`,
      });
    },
    [sendTransaction]
  );

  return { approveErc20, ...other };
}

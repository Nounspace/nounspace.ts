"use client";
import { encodeFunctionData } from "viem";
import { nounsAuctionHouseConfig } from "@nouns/data/generated/wagmi";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";

interface UseCreateBidReturnType extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  settleCurrentAndCreateNew: () => void;
}

export function useSettleCurrentAndCreateNew(): UseCreateBidReturnType {
  const { sendTransaction, ...other } = useSendTransaction();

  async function settleCurrentAndCreateNew() {
    // TODO: Validate can settle (?)

    const request = {
      to: nounsAuctionHouseConfig.address,
      data: encodeFunctionData({
        abi: nounsAuctionHouseConfig.abi,
        functionName: "settleCurrentAndCreateNewAuction",
      }),
      value: BigInt(0),
      gasFallback: BigInt(600000), // settleCurrentAndCreateNewAuction generally ~400k
    };

    return sendTransaction(request, { type: "settle-auction", description: "Settle auction" });
  }

  return { settleCurrentAndCreateNew, ...other };
}

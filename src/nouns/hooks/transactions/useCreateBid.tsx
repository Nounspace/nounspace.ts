"use client";
import { UseSendTransactionReturnType, useSendTransaction } from "./useSendTransaction";
import { encodeFunctionData, formatEther } from "viem";
import { nounsAuctionHouseConfig } from "@nouns/data/generated/wagmi";
import { CustomTransactionValidationError } from "./types";
import { CLIENT_ID } from "@nouns/utils/constants";
import { multicall } from "viem/actions";
import { CHAIN_CONFIG } from "@nouns/config";
import { bigIntMax } from "@nouns/utils/bigint";

const BID_DECIMAL_PRECISION = 2;
interface UseCreateBidReturnType extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  createBid: (nounId: bigint, bidAmount: bigint) => void;
}

export function useCreateBid(): UseCreateBidReturnType {
  const { sendTransaction, ...other } = useSendTransaction();

  async function createBidValidation(
    nounId: bigint,
    bidAmount: bigint
  ): Promise<CustomTransactionValidationError | null> {
    const [{ nounId: auctionNounId, endTime, amount: highestBid }, reservePrice, minBidIncrementPercentage] =
      await multicall(CHAIN_CONFIG.publicClient, {
        contracts: [
          { ...nounsAuctionHouseConfig, functionName: "auction" },
          { ...nounsAuctionHouseConfig, functionName: "reservePrice" },
          { ...nounsAuctionHouseConfig, functionName: "minBidIncrementPercentage" },
        ],
        allowFailure: false,
      });

    const nowS = BigInt(Math.floor(Date.now() / 1000));

    const minNextBid = bigIntMax(
      reservePrice,
      highestBid + (highestBid * BigInt(minBidIncrementPercentage)) / BigInt(100)
    );

    if (nounId !== auctionNounId || nowS > endTime) {
      // Auction must be active
      return new CustomTransactionValidationError("AUCTION_ENDED", "This auction has ended.");
    } else if (bidAmount < minNextBid) {
      // Must be above min bid amount
      const nextMinBidFormatted =
        Math.ceil(Number(formatEther(minNextBid)) * 10 ** BID_DECIMAL_PRECISION) / 10 ** BID_DECIMAL_PRECISION;
      return new CustomTransactionValidationError(
        "BID_AMOUNT_TOO_LOW",
        `The bid amount must be ${nextMinBidFormatted} or more.`
      );
    }

    return null;
  }

  async function createBid(nounId: bigint, bidAmount: bigint) {
    const request = {
      to: nounsAuctionHouseConfig.address,
      data: encodeFunctionData({
        abi: nounsAuctionHouseConfig.abi,
        functionName: "createBid",
        args: [nounId, CLIENT_ID],
      }),
      value: bidAmount,
      gasFallback: BigInt(100000), // Bid generally ~60k
    };

    return sendTransaction(request, { type: "create-bid", description: "Create bid" }, () =>
      createBidValidation(nounId, bidAmount)
    );
  }

  return { createBid, ...other };
}

"use client";
import { encodeFunctionData, Hex } from "viem";
import {
  UseSendTransactionReturnType,
  useSendTransaction,
} from "./useSendTransaction";
import { useCallback } from "react";

import { CustomTransactionValidationError } from "./types";
import { useAccount } from "wagmi";
import { getBlock, multicall } from "viem/actions";
import { CHAIN_CONFIG } from "@nouns/config";
import { nounsDaoLogicConfig } from "@nouns/data/generated/wagmi";
import { CLIENT_ID } from "@nouns/utils/constants";

interface UseCastRefundableVoteReturnType
  extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  castRefundableVote: (
    proposalId: number,
    vote: "for" | "against" | "abstain",
    reason?: string,
  ) => void;
}

const VOTE_MAP: Record<"for" | "against" | "abstain", number> = {
  against: 0,
  for: 1,
  abstain: 2,
};

export function useCastRefundableVote(): UseCastRefundableVoteReturnType {
  const { sendTransaction, ...other } = useSendTransaction();
  const { address } = useAccount();

  const castRefundableVoteValidation = useCallback(
    async (
      proposalId: number,
      vote: "for" | "against" | "abstain",
      reason?: string,
    ): Promise<CustomTransactionValidationError | null> => {
      if (!address) {
        // Never should get here, since sendTransaction enforces connected
        return new CustomTransactionValidationError(
          "NOT_CONNECTED",
          "Wallet not connected.",
        );
      }

      const [{ hasVoted }, { startBlock, endBlock }] = await multicall(
        CHAIN_CONFIG.publicClient,
        {
          contracts: [
            {
              ...nounsDaoLogicConfig,
              functionName: "getReceipt",
              args: [BigInt(proposalId), address],
            },
            {
              ...nounsDaoLogicConfig,
              functionName: "proposals",
              args: [BigInt(proposalId)],
            },
          ],
          allowFailure: false,
        },
      );

      if (hasVoted) {
        return new CustomTransactionValidationError(
          "ALREADY_VOTED",
          "Address has already voted.",
        );
      }

      const currentBlock = await getBlock(CHAIN_CONFIG.publicClient);
      if (currentBlock.number < startBlock) {
        return new CustomTransactionValidationError(
          "VOTING_NOT_STARTED",
          "The voting period has not started yet.",
        );
      }

      if (currentBlock.number > endBlock) {
        return new CustomTransactionValidationError(
          "VOTING_ENDED",
          "The voting period has ended.",
        );
      }

      return null;
    },
    [address],
  );

  const castRefundableVote = useCallback(
    (
      proposalId: number,
      vote: "for" | "against" | "abstain",
      reason?: string,
    ) => {
      let data: Hex;
      if (reason && reason != "") {
        data = encodeFunctionData({
          abi: nounsDaoLogicConfig.abi,
          functionName: "castRefundableVoteWithReason",
          args: [BigInt(proposalId), VOTE_MAP[vote], reason, CLIENT_ID],
        });
      } else {
        data = encodeFunctionData({
          abi: nounsDaoLogicConfig.abi,
          functionName: "castRefundableVote",
          args: [BigInt(proposalId), VOTE_MAP[vote], CLIENT_ID],
        });
      }

      const request = {
        to: nounsDaoLogicConfig.address,
        data,
        value: BigInt(0),
        gasFallback: BigInt(500000), // Vote generally ~200k, can be more if reason is long
      };

      return sendTransaction(
        request,
        { type: "cast-vote", description: `Cast vote on prop ${proposalId}` },
        () => castRefundableVoteValidation(proposalId, vote, reason),
      );
    },
    [sendTransaction, castRefundableVoteValidation],
  );

  return { castRefundableVote, ...other };
}

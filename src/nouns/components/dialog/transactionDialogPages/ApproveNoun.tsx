"use client";
import NounCard from "@nouns/components/NounCard";
import { Noun } from "@nouns/data/noun/types";
import { useApproveNoun } from "@nouns/hooks/transactions/useApproveNoun";
import { ReactNode, useCallback, useEffect } from "react";
import TransactionButton from "@nouns/components/TransactionButton";
import { Address } from "viem";

interface ApproveNounProps {
  noun: Noun;
  spender: Address;
  progressStepper: ReactNode;
  reason: string;
}

export function ApproveNoun({ noun, progressStepper, reason, spender }: ApproveNounProps) {
  const { approveNoun, error, state } = useApproveNoun();

  const approveCallback = useCallback(() => {
    approveNoun(BigInt(noun.id), spender);
  }, [approveNoun, noun.id, spender]);

  // Autotrigger on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    approveCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <NounCard noun={noun} size={80} enableHover={false} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h4>Approve Noun {noun.id}</h4>
        <span className="text-content-secondary">{reason}</span>
      </div>
      {progressStepper}
      <div className="flex w-full flex-col gap-1">
        <TransactionButton txnState={state} onClick={approveCallback} className="w-full">
          Approve Noun
        </TransactionButton>
        <span className="paragraph-sm text-semantic-negative">{error?.message}</span>
      </div>
    </div>
  );
}

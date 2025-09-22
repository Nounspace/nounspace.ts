"use client";
import { ReactNode, useCallback, useEffect } from "react";
import TransactionButton from "@nouns/components/TransactionButton";
import { Noun } from "@nouns/data/noun/types";
import SwapNounGraphic from "@nouns/components/SwapNounGraphic";
import { useCreateSwapPropCandidate } from "@nouns/hooks/transactions/useCreateSwapPropCandidate";
import { useRouter } from "next/navigation";

interface ApproveNounProps {
  userNoun: Noun;
  treasuryNoun: Noun;
  tip: bigint;
  reason: string;
  progressStepper: ReactNode;
}

export function CreatePropCandidate({ userNoun, treasuryNoun, tip, reason, progressStepper }: ApproveNounProps) {
  const { createCandidate, error, state } = useCreateSwapPropCandidate();

  const router = useRouter();

  const createCandidateCallback = useCallback(() => {
    createCandidate(userNoun, treasuryNoun, tip, reason);
  }, [createCandidate, userNoun, treasuryNoun, tip, reason]);

  // Autotrigger on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    createCandidateCallback();
  }, []);

  // Push to proposals page on success
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (state == "success") {
      timeout = setTimeout(() => {
        router.push(`/proposals`);
      }, 4000); // delay transition so subgraph can index
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [state, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <SwapNounGraphic fromNoun={userNoun} toNoun={treasuryNoun} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h4>Create a Swap Prop Candidate</h4>
        <span className="text-content-secondary">
          This will create a prop candidate in the Nouns DAO to swap Noun {userNoun.id} for Noun {treasuryNoun.id}.
        </span>
      </div>
      {progressStepper}
      <div className="flex w-full flex-col gap-1">
        <TransactionButton txnState={state} onClick={createCandidateCallback} className="w-full">
          Create Prop Candidate
        </TransactionButton>
        <span className="paragraph-sm text-semantic-negative">{error?.message}</span>
      </div>
    </div>
  );
}

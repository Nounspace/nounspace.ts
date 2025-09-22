"use client";
import NounCard from "@nouns/components/NounCard";
import { Noun } from "@nouns/data/noun/types";
import { ReactNode, useCallback, useEffect } from "react";
import TransactionButton from "@nouns/components/TransactionButton";
import { useNounsErc20Deposit } from "@nouns/hooks/transactions/useNounsErc20Deposit";
import { forceAllNounRevalidation } from "@nouns/data/noun/getAllNouns";
import ConvertNounGraphic from "@nouns/components/ConvertNounGraphic";
import { useRouter } from "next/navigation";

interface NounsErc20DepositNounProps {
  noun: Noun;
  progressStepper: ReactNode;
}

export function NounsErc20DepositNoun({ noun, progressStepper }: NounsErc20DepositNounProps) {
  const { deposit, error, state, hash } = useNounsErc20Deposit();
  const router = useRouter();

  const depositCallback = useCallback(() => {
    deposit(BigInt(noun.id));
  }, [deposit, noun.id]);

  // Autotrigger on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    depositCallback();
  }, []);

  // Push to swap success page
  useEffect(() => {
    if (state == "success") {
      forceAllNounRevalidation(); // Force revalidation so will update explore
      router.push(`/success/${hash}/deposit/${noun.id}`);
    }
  }, [state, router, noun.id, hash]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <ConvertNounGraphic noun={noun} action="deposit" />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h4>Confirm Conversion</h4>
        <span className="text-content-secondary">
          This will deposit Noun {noun.id} into the $nouns ERC-20 contract, giving you 1,000,000 $nouns.
        </span>
      </div>
      {progressStepper}
      <div className="flex w-full flex-col gap-1">
        <TransactionButton txnState={state} onClick={depositCallback} className="w-full">
          Convert
        </TransactionButton>
        <span className="paragraph-sm text-semantic-negative">{error?.message}</span>
      </div>
    </div>
  );
}

"use client";
import NounCard from "@nouns/components/NounCard";
import { Noun } from "@nouns/data/noun/types";
import { ReactNode, useCallback, useEffect } from "react";
import TransactionButton from "@nouns/components/TransactionButton";
import { useNounsErc20Deposit } from "@nouns/hooks/transactions/useNounsErc20Deposit";
import { forceAllNounRevalidation } from "@nouns/data/noun/getAllNouns";
import ConvertNounGraphic from "@nouns/components/ConvertNounGraphic";
import { useNounsErc20Redeem } from "@nouns/hooks/transactions/useNounsErc20Redeem";
import { useRouter } from "next/navigation";

interface NounsErc20RedeemProps {
  noun: Noun;
}

export function NounsErc20Redeem({ noun }: NounsErc20RedeemProps) {
  const { redeem, error, state, hash } = useNounsErc20Redeem();
  const router = useRouter();

  const redeemCallback = useCallback(() => {
    redeem(BigInt(noun.id));
  }, [redeem, noun.id]);

  // Autotrigger on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    redeemCallback();
  }, []);

  // Push to swap success page
  useEffect(() => {
    if (state == "success") {
      forceAllNounRevalidation(); // Force revalidation so will update explore
      router.push(`/success/${hash}/redeem/${noun.id}`);
    }
  }, [state, router, noun.id, hash]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <ConvertNounGraphic noun={noun} action="redeem" />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h4>Confirm Conversion</h4>
        <span className="text-content-secondary">This will redeem 1,000,000 $nouns for Noun {noun.id}.</span>
      </div>
      <div className="flex w-full flex-col gap-1">
        <TransactionButton txnState={state} onClick={redeemCallback} className="w-full">
          Convert
        </TransactionButton>
        <span className="paragraph-sm text-semantic-negative">{error?.message}</span>
      </div>
    </div>
  );
}

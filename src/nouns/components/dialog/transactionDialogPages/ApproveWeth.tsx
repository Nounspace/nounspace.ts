"use client";
import { ReactNode, useCallback, useEffect } from "react";
import { CHAIN_CONFIG } from "@nouns/config";
import { useApproveErc20 } from "@nouns/hooks/transactions/useApproveErc20";
import Image from "next/image";
import { formatTokenAmount } from "@nouns/utils/utils";
import { NATIVE_ASSET_DECIMALS } from "@nouns/utils/constants";
import TransactionButton from "@nouns/components/TransactionButton";

interface ApproveNounProps {
  amount: bigint;
  progressStepper: ReactNode;
}

export function ApproveWeth({ amount, progressStepper }: ApproveNounProps) {
  const { approveErc20, error, state } = useApproveErc20();

  const approveCallback = useCallback(() => {
    approveErc20(CHAIN_CONFIG.addresses.wrappedNativeToken, CHAIN_CONFIG.addresses.nounsTreasury, amount);
  }, [approveErc20, amount]);

  // Autotrigger on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    approveCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Image src="/ethereum-logo.png" width={80} height={80} alt="WETH" />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h4>Approve WETH</h4>
        <span className="text-content-secondary">
          Give the Nouns Treasury permission to withdraw the {formatTokenAmount(amount, NATIVE_ASSET_DECIMALS, 6)} WETH
          tip if the prop passes.
        </span>
      </div>
      {progressStepper}
      <div className="flex w-full flex-col gap-1">
        <TransactionButton txnState={state} onClick={approveCallback} className="w-full">
          Approve WETH
        </TransactionButton>
        <span className="paragraph-sm text-semantic-negative">{error?.message}</span>
      </div>
    </div>
  );
}

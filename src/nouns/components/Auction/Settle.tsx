"use client";
import { useSettleCurrentAndCreateNew } from "@nouns/hooks/transactions/useSettleCurrentAndCreateNew";
import TransactionButton from "../TransactionButton";

export default function Settle() {
  const { settleCurrentAndCreateNew, error, state: txnState } = useSettleCurrentAndCreateNew();

  return (
    <div className="flex w-full flex-col gap-1 md:max-w-[400px]">
      <TransactionButton onClick={settleCurrentAndCreateNew} txnState={txnState}>
        Start next auction
      </TransactionButton>
      {error && <div className="text-semantic-negative paragraph-sm">{error.message}</div>}
    </div>
  );
}

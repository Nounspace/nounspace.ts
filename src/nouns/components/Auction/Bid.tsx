"use client";
import { formatEther, parseEther } from "viem";
import { Input } from "@nouns/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useCreateBid } from "@nouns/hooks/transactions/useCreateBid";
import TransactionButton from "../TransactionButton";

const BID_DECIMAL_PRECISION = 2;

interface BidProps {
  nounId: bigint;
  nextMinBid: bigint;
}

export default function Bid({ nounId, nextMinBid }: BidProps) {
  const { createBid, error: createBidError, state: txnState, reset: resetCreateBid } = useCreateBid();

  const nextMinBidFormatted = useMemo(() => {
    return Math.ceil(Number(formatEther(nextMinBid)) * 10 ** BID_DECIMAL_PRECISION) / 10 ** BID_DECIMAL_PRECISION;
  }, [nextMinBid]);

  // Used to restrict user input
  const [bidAmount, setBidAmount] = useState<string>(nextMinBidFormatted.toString());
  function handleBidAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const regex = new RegExp(`^\\d*\\.?\\d{0,${BID_DECIMAL_PRECISION}}$`);
    if (regex.test(value)) {
      resetCreateBid();
      setBidAmount(value);
    }
  }

  // Update prefilled bid if minBid changes
  useEffect(() => {
    setBidAmount((prev) => {
      const prevNum = Number(prev);
      return prevNum < nextMinBidFormatted ? nextMinBidFormatted.toString() : prev;
    });
  }, [nextMinBidFormatted]);

  async function onSubmit(formData: FormData) {
    const parsedBidAmount = parseEther(formData.get("bidAmount") as string);
    createBid(nounId, parsedBidAmount);
  }

  // Clear on successful txn
  useEffect(() => {
    if (txnState === "success") {
      resetCreateBid();
      setBidAmount("");
    }
  }, [txnState, resetCreateBid]);

  return (
    <div className="flex w-full flex-col gap-1">
      <form action={onSubmit} className="flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="relative h-full w-full md:w-[260px]">
          <Input
            placeholder={`Ξ ${nextMinBidFormatted} or more`}
            className="h-full w-full pr-[52px]"
            name="bidAmount"
            value={bidAmount}
            onChange={handleBidAmountChange}
            disabled={txnState != "idle"}
            inputMode="decimal"
          />
          <span className="label-lg absolute right-3 top-1/2 -translate-y-1/2">ETH</span>
        </div>
        <TransactionButton
          type="submit"
          disabled={nextMinBid == undefined}
          txnState={txnState}
          className="w-full md:w-[131px]"
        >
          Place Bid
        </TransactionButton>
      </form>
      <div className="text-semantic-negative paragraph-sm">{createBidError?.message}</div>
    </div>
  );
}

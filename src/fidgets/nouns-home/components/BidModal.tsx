'use client';

import React, { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { formatEth } from "../utils";

interface BidModalProps {
  isOpen: boolean;
  nounId: bigint;
  currentAmount: bigint;
  onDismiss: () => void;
  onConfirm: (valueWei: bigint) => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  nounId,
  currentAmount,
  onDismiss,
  onConfirm,
  isSubmitting,
  errorMessage,
}) => {
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const minSuggested = useMemo(() => {
    if (currentAmount === 0n) {
      return "0.1";
    }
    const fivePct = (currentAmount * 105n) / 100n;
    return formatEther(fivePct);
  }, [currentAmount]);

  useEffect(() => {
    if (!isOpen) {
      setValue("");
      setInputError(null);
      return;
    }
    setValue(minSuggested);
  }, [isOpen, minSuggested]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!value) {
        setInputError("Enter a bid amount");
        return;
      }
      const parsed = parseEther(value as `${number}`);
      if (parsed <= currentAmount) {
        setInputError("Bid must exceed the current amount");
        return;
      }
      setInputError(null);
      onConfirm(parsed);
    } catch (error) {
      console.error(error);
      setInputError("Enter a valid ETH amount");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Place a bid</h2>
            <p className="text-sm text-muted-foreground">
              Noun {nounId.toString()} - Current bid {formatEth(currentAmount)}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black transition hover:bg-black/10"
          >
            Close
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Bid amount (ETH)
            <input
              name="bid"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-black"
              placeholder={minSuggested}
              aria-invalid={Boolean(inputError)}
            />
          </label>

          <p className="text-xs text-muted-foreground">
            Bids must exceed the current bid by the on-chain minimum increment
            (approx.5%). The auction house contract enforces the exact rule.
          </p>

          {(inputError || errorMessage) && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {inputError || errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
          >
            {isSubmitting ? "Submitting..." : "Confirm bid"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BidModal;

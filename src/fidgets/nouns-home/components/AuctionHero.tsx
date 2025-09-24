'use client';

import React from "react";
import NounImage from "../NounImage";
import LinkOut from "../LinkOut";
import { formatCountdown, formatEth, getAuctionStatus } from "../utils";
import type { Auction } from "../types";

interface AuctionHeroProps {
  auction?: Auction;
  ensName?: string | null;
  countdownMs: number;
  onOpenBid: () => void;
  onSettle: () => void;
  isSettling: boolean;
  isConnected: boolean;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const AuctionHero: React.FC<AuctionHeroProps> = ({
  auction,
  ensName,
  countdownMs,
  onOpenBid,
  onSettle,
  isSettling,
  isConnected,
}) => {
  const status = getAuctionStatus(auction);
  const nounId = auction ? Number(auction.nounId) : undefined;
  const bidderLabel =
    auction && auction.bidder !== ZERO_ADDRESS
      ? ensName || `${auction.bidder.slice(0, 6)}...${auction.bidder.slice(-4)}`
      : "No bids yet";

  const countdownLabel = formatCountdown(countdownMs);
  const etherLabel = auction ? formatEth(auction.amount, 3) : "Loading";
  const isEnded = status === "ended";
  const buttonDisabled = isEnded
    ? !auction || auction.settled || isSettling
    : status === "pending";

  const primaryLabel = isEnded && auction && !auction.settled
    ? isSettling
      ? "Settling..."
      : "Settle auction"
    : !isConnected
      ? "Connect wallet"
      : "Place bid";

  return (
    <section className="rounded-3xl bg-[#f0f0ff] p-6 text-[#17171d] shadow-sm md:p-10">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
        <div className="flex items-center justify-center">
          {nounId !== undefined ? (
            <NounImage
              nounId={auction!.nounId}
              className="h-auto w-full max-w-[320px] rounded-3xl border border-black/10 bg-white"
              priority
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white">
              <span className="text-sm text-muted-foreground">Fetching Noun...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8c8ca1]">
              Daily auction
            </p>
            <h1 className="text-4xl font-semibold md:text-5xl">
              {nounId !== undefined ? `Noun ${nounId}` : "Loading"}
            </h1>
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-semibold md:text-5xl">{etherLabel}</span>
                <span className="pb-2 text-xs uppercase tracking-[0.3em] text-[#8c8ca1]">
                  Current bid
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8c8ca1]">
                    Time remaining
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {status === "ended" ? "00:00" : countdownLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8c8ca1]">
                    Leading bidder
                  </p>
                  <p className="mt-2 text-xl font-semibold">{bidderLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <button
              type="button"
              onClick={
                status === "ended" && auction && !auction.settled
                  ? onSettle
                  : onOpenBid
              }
              disabled={buttonDisabled}
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
              aria-live="polite"
            >
              {primaryLabel}
            </button>
            <div className="flex flex-wrap gap-3">
              {nounId !== undefined && (
                <LinkOut
                  href={`https://www.nouns.com/noun/${nounId}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-4 text-base font-medium text-[#17171d] shadow-sm transition hover:bg-white/70"
                >
                  View on nouns.com
                </LinkOut>
              )}
              {nounId !== undefined && (
                <LinkOut
                  href={`https://opensea.io/assets/ethereum/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03/${nounId}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-4 text-base font-medium text-[#17171d] shadow-sm transition hover:bg-white/70"
                >
                  View on OpenSea
                </LinkOut>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

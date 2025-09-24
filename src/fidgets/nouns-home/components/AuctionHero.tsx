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
    auction && auction.bidder !== "0x0000000000000000000000000000000000000000"
      ? ensName || `${auction.bidder.slice(0, 6)}...${auction.bidder.slice(-4)}`
      : "No bids yet";

  const ctaLabel = status === "ended" && auction && !auction.settled
    ? "Settle auction"
    : "Place bid";

  const countdownLabel = formatCountdown(countdownMs);

  const etherLabel = auction ? formatEth(auction.amount, 3) : "Loading";
  const isEnded = status === "ended";
  const buttonDisabled = isEnded
    ? !auction || auction.settled || isSettling
    : status === "pending";

  return (
    <section
      aria-label="Current Noun auction"
      className="rounded-3xl bg-[#f0f0ff] p-6 text-[#17171d] shadow-sm md:p-10"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-10">
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

        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8c8ca1]">
              Now on auction
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {nounId !== undefined ? `Noun ${nounId}` : "Loading"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-base md:text-lg">
              <span className="rounded-full bg-white px-4 py-2 font-medium shadow-sm">
                Current bid: {etherLabel}
              </span>
              <span className="rounded-full bg-white px-4 py-2 font-medium shadow-sm">
                Time left: {status === "ended" ? "00:00" : countdownLabel}
              </span>
              <span className="rounded-full bg-white px-4 py-2 font-medium shadow-sm">
                Bidder: {bidderLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
              {status === "ended" && auction && !auction.settled
                ? isSettling
                  ? "Settling..."
                  : "Settle auction"
                : !isConnected
                  ? "Connect wallet"
                  : ctaLabel}
            </button>
            <div className="flex gap-3">
              {nounId !== undefined && (
                <LinkOut
                  href={`https://nouns.wtf/noun/${nounId}`}
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

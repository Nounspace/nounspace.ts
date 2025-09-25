'use client';

import React, { useState } from 'react';
import { parseEther } from 'viem';
import NounImage from '../NounImage';
import { formatCountdown, formatEth, getAuctionStatus } from '../utils';
import type { Auction } from '../types';

interface AuctionHeroProps {
  auction?: Auction;
  ensName?: string | null;
  countdownMs: number;
  onOpenBid: () => void;
  onSettle: () => void;
  isSettling: boolean;
  isConnected: boolean;
  headingFontClassName?: string;
  dateLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  backgroundHex?: string;
  minRequiredWei?: bigint;
  onPlaceBid?: (valueWei: bigint) => void;
  floorPriceNative?: number | undefined;
  topOfferNative?: number | undefined;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const AuctionHero: React.FC<AuctionHeroProps> = ({
  auction,
  ensName,
  countdownMs,
  onOpenBid,
  onSettle,
  isSettling,
  isConnected,
  headingFontClassName,
  dateLabel,
  onPrev,
  onNext,
  canGoNext,
  backgroundHex,
  minRequiredWei,
  onPlaceBid,
  floorPriceNative,
  topOfferNative,
}) => {
  const status = getAuctionStatus(auction);
  const nounId = auction ? Number(auction.nounId) : undefined;
  const bidderLabel =
    auction && auction.bidder !== ZERO_ADDRESS
      ? ensName || `${auction.bidder.slice(0, 6)}...${auction.bidder.slice(-4)}`
      : 'No bids yet';
  const countdownLabel = formatCountdown(countdownMs);
  const etherLabel = auction ? formatEth(auction.amount, 3) : 'Loading';
  const isEnded = status === 'ended';
  const buttonDisabled = isEnded ? !auction || auction.settled || isSettling : status === 'pending';

  const [bidInput, setBidInput] = useState('');
  const handleBidClick = () => {
    if (!onPlaceBid) return onOpenBid();
    try {
      const wei = parseEther((bidInput || '0') as `${number}`);
      onPlaceBid(wei);
    } catch {
      onOpenBid();
    }
  };

  return (
    <section
      className="rounded-3xl p-6 text-[#17171d] shadow-sm md:p-10"
      style={{ backgroundColor: backgroundHex ?? '#f0f0ff' }}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,520px)_1fr] md:gap-12">
        <div className="flex items-end justify-center md:justify-start">
          {nounId !== undefined ? (
            <NounImage
              nounId={auction!.nounId}
              className="h-[420px] w-auto max-w-full object-contain md:h-[520px]"
              priority
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50">
              <span className="text-sm text-muted-foreground">Fetching Noun...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-[#5a5a70]">
              {onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow"
                  aria-label="Previous auction"
                >
                  ←
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow disabled:opacity-40"
                  aria-label="Next auction"
                >
                  →
                </button>
              )}
              {dateLabel && <span className="ml-1">{dateLabel}</span>}
            </div>
            <h1 className={`text-4xl font-semibold md:text-6xl ${headingFontClassName ?? ''}`}>
              {nounId !== undefined ? `Noun ${nounId}` : 'Loading'}
            </h1>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-10">
                <div>
                  <div className="text-sm font-semibold text-[#5a5a70]">Current bid</div>
                  <div className="text-4xl font-semibold md:text-5xl">{etherLabel}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#5a5a70]">Time left</div>
                  <div className="text-2xl font-semibold">{status === 'ended' ? '00:00' : countdownLabel}</div>
                </div>
              </div>
              <div className="text-sm text-[#6b6b80]">
                <span className="mr-2">ℹ️</span>
                <a
                  href="https://www.nouns.com/explore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Floor price
                </a>
                : {typeof floorPriceNative === 'number' ? `${floorPriceNative.toFixed(2)} ETH` : '—'}
                <span className="mx-2">•</span>
                <a
                  href="https://www.nouns.com/explore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Top offer
                </a>
                : {typeof topOfferNative === 'number' ? `${topOfferNative.toFixed(2)} ETH` : '—'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            {status === 'ended' && auction && !auction.settled ? (
              <button
                type="button"
                onClick={onSettle}
                disabled={buttonDisabled}
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {isSettling ? 'Settling...' : 'Settle auction'}
              </button>
            ) : (
              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  className="flex-1 rounded-[12px] border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-black"
                  placeholder={minRequiredWei ? String(Number(minRequiredWei) / 1e18) : '0.1'}
                  inputMode="decimal"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  disabled={isEnded}
                  aria-label="Bid amount in ETH"
                />
                <button
                  type="button"
                  onClick={handleBidClick}
                  disabled={isEnded || buttonDisabled}
                  className="inline-flex h-12 items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                >
                  Place Bid
                </button>
              </div>
            )}
            <div className="text-sm text-[#5a5a70]">Highest bidder {bidderLabel}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

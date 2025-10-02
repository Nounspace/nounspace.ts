'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
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
  headingFontFamilyCss?: string;
  dateLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  backgroundHex?: string;
  minRequiredWei?: bigint;
  onPlaceBid?: (valueWei: bigint) => void;
  floorPriceNative?: number | undefined;
  topOfferNative?: number | undefined;
  isCurrentView?: boolean;
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
  headingFontFamilyCss,
  dateLabel,
  onPrev,
  onNext,
  canGoNext,
  backgroundHex,
  minRequiredWei,
  onPlaceBid,
  floorPriceNative,
  topOfferNative,
  isCurrentView = true,
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
      className="rounded-3xl p-6 text-[#17171d] shadow-sm md:p-10 md:min-h-[420px] overflow-visible md:overflow-hidden"
      style={{ backgroundColor: backgroundHex ?? '#f0f0ff' }}
    >
      <div className="mx-auto grid h-full max-w-[1200px] items-center gap-6 md:grid-cols-[minmax(0,520px)_minmax(0,560px)] md:gap-12">
        <div className="flex h-full items-end justify-center md:justify-start md:ml-8">
          {nounId !== undefined ? (
            <NounImage
              nounId={auction!.nounId}
              className="h-[200px] w-auto max-w-full object-contain sm:h-[260px] md:h-[400px] md:translate-y-10"
              priority
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50">
              <span className="text-sm text-muted-foreground">Fetching Noun...</span>
            </div>
          )}
        </div>

        <div className="-mt-6 flex flex-col justify-center gap-4 pl-4 pr-4 md:mt-0 md:pl-10 md:pr-6 self-center bg-white border border-black/10 rounded-2xl p-4 md:bg-transparent md:border-0 md:rounded-none md:p-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-[#5a5a70]">
              {onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/15 bg-white text-black"
                  aria-label="Previous auction"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/15 bg-white text-black disabled:opacity-40"
                  aria-label="Next auction"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              {dateLabel && <span className="ml-1 font-semibold">{dateLabel}</span>}
            </div>
            <h1
              className={`text-3xl font-semibold md:text-5xl ${headingFontClassName ?? ''}`}
              style={headingFontFamilyCss ? { fontFamily: headingFontFamilyCss } : undefined}
            >
              {nounId !== undefined ? `Noun ${nounId}` : 'Loading'}
            </h1>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-10">
                <div>
                  <div className="text-sm font-medium text-[#5a5a70]">{isCurrentView ? 'Current bid' : 'Winning bid'}</div>
                  <div className="text-3xl font-medium md:text-4xl">{etherLabel}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#5a5a70]">{isCurrentView ? 'Time left' : 'Won by'}</div>
                  <div className="text-3xl font-medium md:text-4xl">
                    {isCurrentView
                      ? (status === 'ended' ? '00:00' : countdownLabel)
                      : (
                        auction && auction.bidder !== '0x0000000000000000000000000000000000000000' ? (
                          <a href={`https://etherscan.io/address/${auction.bidder}`} target="_blank" rel="noopener noreferrer" className="underline">
                            {bidderLabel}
                          </a>
                        ) : '-'
                      )}
                  </div>
                </div>
              </div>
              {isCurrentView && (
              <div className="flex items-center text-sm font-medium text-[#6b6b80]">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#d9dbe8] text-[#5a5a70]"><Info className="h-4 w-4" /></span>
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
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:gap-2 md:mt-1">
            {isCurrentView && status === 'ended' && auction && !auction.settled ? (
              <button
                type="button"
                onClick={onSettle}
                disabled={buttonDisabled}
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {isSettling ? 'Settling...' : 'Settle auction'}
              </button>
            ) : isCurrentView ? (
              <>
              <div className="flex w-full max-w-md items-center gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full rounded-[12px] border-2 border-black/10 bg-white px-4 py-3 pr-16 text-base outline-none focus:border-black placeholder:font-semibold"
                    placeholder={minRequiredWei ? String(Number(minRequiredWei) / 1e18) : '0.1'}
                    inputMode="decimal"
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    disabled={isEnded}
                    aria-label="Bid amount in ETH"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[8px] border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-[#5a5a70]">ETH</span>
                </div>
                  <button
                    type="button"
                    onClick={handleBidClick}
                    disabled={isEnded || buttonDisabled}
                    className="inline-flex h-12 items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                  >
                    Place Bid
                  </button>
                </div>
                <div className="text-sm font-medium text-[#5a5a70]">
                  Highest bidder{' '}
                  {auction && auction.bidder !== ZERO_ADDRESS ? (
                    <a
                      href={`https://etherscan.io/address/${auction.bidder}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {bidderLabel}
                    </a>
                  ) : (
                    bidderLabel
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

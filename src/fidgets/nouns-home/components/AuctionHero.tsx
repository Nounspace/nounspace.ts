'use client';

import React, { useState } from 'react';
import { parseEther } from 'viem';
import NounImage from '../NounImage';
import LinkOut from '../LinkOut';
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
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
        <div className="flex items-center justify-center">
          {nounId !== undefined ? (
            <NounImage nounId={auction!.nounId} className="h-auto w-full max-w-[320px] rounded-3xl border border-black/10 bg-white" priority />
          ) : (
            <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-3xl border border-dashed border-black/10 bg-white">
              <span className="text-sm text-muted-foreground">Fetching Noun...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm text-[#8c8ca1]">
              {onPrev && (
                <button type="button" onClick={onPrev} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow" aria-label="Previous auction">←</button>
              )}
              {dateLabel && <span>{dateLabel}</span>}
              {onNext && (
                <button type="button" onClick={onNext} disabled={!canGoNext} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow disabled:opacity-40" aria-label="Next auction">→</button>
              )}
            </div>
            <h1 className={`text-4xl font-semibold md:text-6xl ${headingFontClassName ?? ''}`}>{nounId !== undefined ? `Noun ${nounId}` : 'Loading'}</h1>
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-semibold md:text-5xl">{etherLabel}</span>
                <span className="pb-2 text-xs uppercase tracking-[0.3em] text-[#8c8ca1]">Current bid</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="uppercase tracking-[0.2em] text-[#8c8ca1]">Time left</span>
                  <span className="font-semibold text-lg">{status === 'ended' ? '00:00' : countdownLabel}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="uppercase tracking-[0.2em] text-[#8c8ca1]">Highest bidder</span>
                  <span className="font-medium">{bidderLabel}</span>
                </div>
              </div>
              <div className="text-sm text-[#6b6b80]">
                <span className="mr-2">ℹ️</span>
                <a href="https://www.nouns.com/explore" target="_blank" rel="noopener noreferrer" className="underline">Floor price</a>: —
                <span className="mx-2">•</span>
                <a href="https://www.nouns.com/explore" target="_blank" rel="noopener noreferrer" className="underline">Top offer</a>: —
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {status === 'ended' && auction && !auction.settled ? (
              <button type="button" onClick={onSettle} disabled={buttonDisabled} className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30">{isSettling ? 'Settling...' : 'Settle auction'}</button>
            ) : (
              <div className="flex w-full max-w-md items-center gap-2">
                <input className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-black" placeholder={minRequiredWei ? String(Number(minRequiredWei) / 1e18) : '0.1'} inputMode="decimal" value={bidInput} onChange={(e) => setBidInput(e.target.value)} disabled={isEnded} aria-label="Bid amount in ETH" />
                <button type="button" onClick={handleBidClick} disabled={isEnded || buttonDisabled} className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30">Place Bid</button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {nounId !== undefined && (
                <LinkOut href={`https://www.nouns.com/noun/${nounId}`} className="inline-flex h-12 items-center justify-center rounded-full bg-white px-4 text-base font-medium text-[#17171d] shadow-sm transition hover:bg-white/70">View on nouns.com</LinkOut>
              )}
              {nounId !== undefined && (
                <LinkOut href={`https://opensea.io/assets/ethereum/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03/${nounId}`} className="inline-flex h-12 items-center justify-center rounded-full bg-white px-4 text-base font-medium text-[#17171d] shadow-sm transition hover:bg-white/70">View on OpenSea</LinkOut>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

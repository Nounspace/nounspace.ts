'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseEther } from 'viem';
import NounImage from '../NounImage';
import { formatCountdown, formatEth, getAuctionStatus } from '../utils';
import type { Auction } from '../types';

interface AuctionHeroProps {
  auction?: Auction;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
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
  isCurrentView?: boolean;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const AuctionHero: React.FC<AuctionHeroProps> = ({
  auction,
  ensName,
  ensAvatarUrl,
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
  isCurrentView = true,
}) => {
  const status = getAuctionStatus(auction);
  const nounId = auction ? Number(auction.nounId) : undefined;
  const hasBidder = Boolean(auction && auction.bidder !== ZERO_ADDRESS);
  const bidderLabel =
    hasBidder && auction
      ? ensName || `${auction.bidder.slice(0, 6)}...${auction.bidder.slice(-4)}`
      : 'No bids yet';
  const bidderHref = hasBidder && auction ? `https://etherscan.io/address/${auction.bidder}` : undefined;
  const countdownLabel = status === 'ended' ? 'Ended' : formatCountdown(countdownMs);
  const etherLabel = auction ? formatEth(auction.amount, 3) : 'Loading';
  const needsSettlement = Boolean(auction && status === 'ended' && !auction.settled);
  const isEnded = status === 'ended';
  const isActiveAuction = status === 'active' && isCurrentView;
  const showSettleCta = needsSettlement;
  const buttonDisabled = isEnded ? !auction || auction.settled || isSettling : status === 'pending';
  const bidButtonLabel = isConnected ? 'Place Bid' : 'Connect to bid';

  const placeholderEth = useMemo(() => {
    if (!minRequiredWei) return '0.10';
    const eth = Number(minRequiredWei) / 1e18;
    const roundedUp = Math.ceil(eth * 100) / 100;
    return roundedUp.toFixed(2);
  }, [minRequiredWei]);

  const [bidInput, setBidInput] = useState('');
  useEffect(() => {
    setBidInput('');
  }, [nounId]);

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
      className="w-full rounded-[32px] px-1 py-2"
      style={{ backgroundColor: backgroundHex ?? '#d5d7e1' }}
    >
      <div className="mx-auto grid h-full max-w-[1200px] items-center gap-6 px-1 md:grid-cols-[minmax(0,500px)_minmax(0,560px)] md:gap-10">
        <div className="flex h-full items-center justify-center md:justify-start md:pl-4">
          {nounId !== undefined ? (
            <NounImage
              nounId={auction!.nounId}
              className="h-[200px] w-auto max-w-full object-contain sm:h-[260px] md:h-[400px]"
              priority
            />
          ) : (
            <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50">
              <span className="text-sm text-muted-foreground">Fetching Noun...</span>
            </div>
          )}
        </div>

        <div className="relative flex flex-col justify-center self-center">
          <div className="rounded-[28px] border border-black/5 bg-white/90 p-5 shadow-xl backdrop-blur md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-semibold text-[#5a5a70]">
                {dateLabel || 'Date pending'}
              </div>
              <div className="flex items-center gap-2">
                {onPrev && (
                  <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:-translate-y-[1px] hover:shadow-sm"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:-translate-y-[1px] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next auction"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h1
                className={`text-3xl font-semibold leading-tight text-[#0f0f15] md:text-5xl ${headingFontClassName ?? ''}`}
                style={headingFontFamilyCss ? { fontFamily: headingFontFamilyCss } : undefined}
              >
                {nounId !== undefined ? `Noun ${nounId}` : 'Loading'}
              </h1>
              <div className="grid gap-4 md:grid-cols-2 md:items-start">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#5a5a70]">
                    {isEnded ? 'Winning bid' : 'Current bid'}
                  </div>
                  <div className="text-3xl font-semibold md:text-4xl">{etherLabel}</div>
                </div>
                <div className="space-y-1 md:text-right">
                  <div className="text-sm font-medium text-[#5a5a70]">
                    {isEnded ? 'Won by' : 'Time left'}
                  </div>
                  <div className="text-3xl font-semibold md:text-4xl">
                    {isEnded ? (
                      bidderHref ? (
                        <a
                          href={bidderHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 underline decoration-[#5a5a70]"
                        >
                          {ensAvatarUrl && (
                            <img
                              src={ensAvatarUrl}
                              alt=""
                              className="h-7 w-7 rounded-full border border-black/10 object-cover"
                            />
                          )}
                          {bidderLabel}
                        </a>
                      ) : (
                        <span className="text-[#5a5a70]">{bidderLabel}</span>
                      )
                    ) : (
                      countdownLabel
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {showSettleCta ? (
                <button
                  type="button"
                  onClick={onSettle}
                  disabled={buttonDisabled}
                  className="inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                >
                  {isSettling ? 'Settling...' : 'Settle Auction'}
                </button>
              ) : isActiveAuction ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <input
                        className="w-full rounded-[14px] border-2 border-black/10 bg-white px-4 py-3 pr-16 text-base font-semibold outline-none transition focus:border-black placeholder:font-semibold"
                        placeholder={placeholderEth}
                        inputMode="decimal"
                        value={bidInput}
                        onChange={(e) => setBidInput(e.target.value)}
                        disabled={isEnded}
                        aria-label="Bid amount in ETH"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[10px] border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-[#5a5a70]">
                        ETH
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleBidClick}
                      disabled={isEnded || buttonDisabled}
                      className="inline-flex h-12 items-center justify-center rounded-[14px] bg-black px-6 text-base font-semibold text-white transition hover:-translate-y-[1px] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                    >
                      {bidButtonLabel}
                    </button>
                  </div>
                  <div className="text-sm font-medium text-[#5a5a70]">
                    {hasBidder ? 'Highest bidder' : 'No bids yet'}
                    {hasBidder && (
                      <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-2.5 py-1">
                        {ensAvatarUrl && (
                          <img
                            src={ensAvatarUrl}
                            alt=""
                            className="h-6 w-6 rounded-full border border-black/10 object-cover"
                          />
                        )}
                        {bidderHref ? (
                          <a
                            href={bidderHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {bidderLabel}
                          </a>
                        ) : (
                          bidderLabel
                        )}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                hasBidder && (
                  <div className="text-sm font-medium text-[#5a5a70]">
                    Won by{' '}
                    {bidderHref ? (
                      <a
                        href={bidderHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 underline"
                      >
                        {ensAvatarUrl && (
                          <img
                            src={ensAvatarUrl}
                            alt=""
                            className="h-6 w-6 rounded-full border border-black/10 object-cover"
                          />
                        )}
                        {bidderLabel}
                      </a>
                    ) : (
                      bidderLabel
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

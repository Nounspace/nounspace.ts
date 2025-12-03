'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseEther } from 'viem';
import NounImage from '../NounImage';
import { formatCountdown, formatEth, getAuctionStatus } from '../utils';
import type { Auction } from '../types';

interface AuctionHeroProps {
  auction?: Auction;
  ensName?: string | null;
  ensAvatar?: string | null;
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
  ensAvatar,
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
  const bidderAddress = auction?.bidder;
  const bidderLabel = hasBidder
    ? ensName || `${auction!.bidder.slice(0, 6)}...${auction!.bidder.slice(-4)}`
    : 'No bids yet';
  const countdownLabel = formatCountdown(countdownMs);
  const etherLabel = auction ? formatEth(auction.amount, 3) : 'Loading';
  const isEnded = status === 'ended';
  const buttonDisabled = isEnded ? !auction || auction.settled || isSettling : status === 'pending';
  const requiresSettlement = isEnded && auction && !auction.settled;
  const isActive = status === 'active';
  const isPastView = !isCurrentView;

  const placeholderEth = useMemo(() => {
    if (!minRequiredWei) return '0.10 ETH min';
    const eth = Number(minRequiredWei) / 1e18;
    const roundedUp = Math.ceil(eth * 100) / 100;
    return `${roundedUp.toFixed(2)} ETH min`;
  }, [minRequiredWei]);

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

  const renderBidder = () => {
    if (!hasBidder || !bidderAddress) {
      return <span className="text-sm text-[#5a5a70]">No bids yet</span>;
    }

    return (
      <a
        href={`https://etherscan.io/address/${bidderAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-sm font-semibold text-[#1f1f2a] transition hover:bg-black/10"
      >
        {ensAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ensAvatar} alt={bidderLabel} className="h-6 w-6 rounded-full" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-[#1f1f2a]">
            {bidderLabel.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="underline decoration-black/30 underline-offset-[3px]">{bidderLabel}</span>
      </a>
    );
  };

  const DetailCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/70 p-3 text-sm font-medium text-[#5a5a70] shadow-sm">
      <span>{label}</span>
      <span className="text-xl font-semibold text-[#1f1f2a]">{value}</span>
    </div>
  );

  const nounHeading = nounId !== undefined ? `Noun ${nounId}` : 'Loading auction...';
  const bidLabel = isPastView || isEnded ? 'Winning bid' : 'Current bid';
  const timeValue = status === 'pending' ? countdownLabel : isActive ? countdownLabel : 'Ended';

  return (
    <section
      className="rounded-3xl border bg-white/75 p-6 text-[#17171d] shadow-sm backdrop-blur md:min-h-[420px] md:p-10"
      style={{ borderColor: backgroundHex ?? '#dcdce5' }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#4a4a59]">{dateLabel ?? 'Auction date pending'}</span>
        <div className="flex items-center gap-2">
          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-black shadow-sm transition hover:-translate-y-[1px]"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-black shadow-sm transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next auction"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,440px)_1fr] md:items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/60 p-4 shadow-inner">
            {nounId !== undefined ? (
              <NounImage
                nounId={auction!.nounId}
                className="h-[260px] w-auto max-w-full object-contain sm:h-[320px] md:h-[400px]"
                priority
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/70">
                <span className="text-sm text-muted-foreground">Fetching Noun...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#4a4a59]">
            <span className="rounded-full bg-black/5 px-3 py-1">{nounHeading}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3">
            <h1
              className={`text-3xl font-semibold md:text-5xl ${headingFontClassName ?? ''}`}
              style={headingFontFamilyCss ? { fontFamily: headingFontFamilyCss } : undefined}
            >
              {nounHeading}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : requiresSettlement
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-black/5 text-[#1f1f2a]'
              }`}
            >
              {requiresSettlement ? 'Needs settlement' : isActive ? 'Active' : 'Ended'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard label="Date of auction" value={dateLabel ?? '—'} />
            <DetailCard label="Auction ID" value={nounId !== undefined ? `#${nounId}` : '—'} />
            <DetailCard label={bidLabel} value={etherLabel} />
            <DetailCard label="Time left" value={timeValue} />
          </div>

          {(isPastView || isEnded || hasBidder) && (
            <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
              <div className="text-sm font-medium text-[#5a5a70]">
                {isPastView || isEnded ? 'Won by' : 'Highest bidder'}
              </div>
              <div className="mt-2">{renderBidder()}</div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {requiresSettlement ? (
              <button
                type="button"
                onClick={onSettle}
                disabled={buttonDisabled}
                className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:scale-[1.01] hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {isSettling ? 'Settling...' : 'Settle auction'}
              </button>
            ) : isCurrentView && isActive ? (
              <>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <input
                      className="w-full rounded-[12px] border-2 border-black/10 bg-white px-4 py-3 pr-16 text-base font-semibold outline-none focus:border-black placeholder:font-semibold"
                      placeholder={placeholderEth}
                      inputMode="decimal"
                      value={bidInput}
                      onChange={(e) => setBidInput(e.target.value)}
                      disabled={isEnded}
                      aria-label="Bid amount in ETH"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[8px] border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-[#5a5a70]">
                      ETH
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBidClick}
                    disabled={isEnded || buttonDisabled}
                    className="inline-flex h-12 items-center justify-center rounded-[12px] bg-black px-6 text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                  >
                    Place bid
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-sm text-[#5a5a70]">Connect your wallet to place a bid.</p>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionHero;

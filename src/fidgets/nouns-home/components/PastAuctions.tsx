'use client';

import React from "react";
import LinkOut from "../LinkOut";
import NounImage from "../NounImage";
import { formatEth } from "../utils";
import type { Settlement } from "../types";

interface PastAuctionsProps {
  settlements: Settlement[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const PastAuctions: React.FC<PastAuctionsProps> = ({
  settlements,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Past auctions</h2>
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        )}
      </header>

      <div className="grid gap-4 overflow-x-auto pb-1 sm:grid-cols-2 lg:grid-cols-3">
        {settlements.map((settlement) => {
          const nounIdNumber = Number(settlement.nounId);
          const auctionDate = dateFormatter.format(
            new Date(settlement.blockTimestamp * 1000),
          );
          return (
            <article
              key={settlement.nounId.toString()}
              className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Noun {nounIdNumber}</h3>
                <span className="text-sm text-muted-foreground">{auctionDate}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[#f8f8ff]">
                  <NounImage nounId={settlement.nounId} className="h-full w-full object-contain" />
                </div>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Final price</dt>
                    <dd className="font-medium">{formatEth(settlement.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Winner</dt>
                    <dd className="font-medium break-all">
                      {settlement.winner ===
                      "0x0000000000000000000000000000000000000000"
                        ? "Settlement executor"
                        : `${settlement.winner.slice(0, 6)}...${settlement.winner.slice(-4)}`}
                    </dd>
                  </div>
                  <div>
                    <LinkOut
                      href={`https://nouns.wtf/noun/${nounIdNumber}`}
                      className="text-sm font-semibold text-[#5a5aff] hover:underline"
                    >
                      View on nouns.com
                    </LinkOut>
                  </div>
                </dl>
              </div>
            </article>
          );
        })}
      </div>

      {settlements.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">No settlements yet.</p>
      )}
    </section>
  );
};

export default PastAuctions;

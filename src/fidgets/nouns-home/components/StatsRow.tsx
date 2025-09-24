'use client';

import React from "react";
import { formatCountdown, formatEth } from "../utils";
import type { Auction } from "../types";

interface StatsRowProps {
  auction?: Auction;
  totalSettled: number;
  treasuryEth?: string;
}

const StatsRow: React.FC<StatsRowProps> = ({ auction, totalSettled, treasuryEth }) => {
  const countdownMs = auction
    ? Number(auction.endTime) * 1000 - Date.now()
    : 0;

  const stats = [
    {
      label: "Total Nouns",
      value: totalSettled.toLocaleString(),
    },
    {
      label: "Current bid",
      value: auction ? formatEth(auction.amount) : "Loading",
    },
    {
      label: "Auction ends in",
      value: formatCountdown(countdownMs),
    },
    treasuryEth
      ? {
        label: "Treasury (est.)",
        value: treasuryEth,
      }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Nouns by the numbers</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/10 bg-[#f7f7ff] p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsRow;

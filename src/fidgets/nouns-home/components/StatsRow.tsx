'use client';

import React from "react";

interface StatsRowProps {
  totalSettled: number;
  nounHolderCount?: number;
  ideasFundedLabel?: string;
  treasuryRaisedLabel?: string;
}

const StatsRow: React.FC<StatsRowProps> = ({
  totalSettled,
  nounHolderCount,
  ideasFundedLabel,
  treasuryRaisedLabel,
}) => {
  const stats = [
    {
      label: "Nouns created",
      value: totalSettled > 0 ? totalSettled.toLocaleString() : "-",
    },
    {
      label: "Noun owners",
      value: nounHolderCount ? nounHolderCount.toLocaleString() : "-",
    },
    {
      label: "Ideas funded",
      value: ideasFundedLabel ?? "Hundreds",
    },
    {
      label: "Treasury deployed",
      value: treasuryRaisedLabel ?? "Millions in ETH",
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">Nouns by the Numbers</h2>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Nouns empower creativity and subcultures, with millions in funding
          distributed to hundreds of ideas, all governed by Noun holders.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/10 bg-[#f7f7ff] p-4"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <a
          href="https://www.nouns.com/stats"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          Explore Stats
        </a>
      </div>
    </section>
  );
};

export default StatsRow;

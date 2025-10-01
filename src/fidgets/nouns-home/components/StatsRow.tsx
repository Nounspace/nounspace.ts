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
      label: "Nouns Created",
      value: totalSettled > 0 ? totalSettled.toLocaleString() : "-",
    },
    {
      label: "Noun Owners",
      value: nounHolderCount ? nounHolderCount.toLocaleString() : "-",
    },
    {
      label: "Ideas Funded",
      value: ideasFundedLabel ?? "455",
    },
    {
      label: "Funded (USD)",
      value: treasuryRaisedLabel ?? "$68M",
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-6 md:p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="user-theme-headings-font text-3xl font-semibold md:text-4xl" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>Nouns by the Numbers</h2>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Nouns empower creativity and subcultures, with millions in funding
          distributed to hundreds of ideas, all governed by Noun holders.
        </p>
      </div>
      <div className="mt-10 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center">
            <p className="user-theme-headings-font text-4xl font-semibold" style={{ fontFamily: 'var(--user-theme-headings-font)' }}>
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{stat.label}</p>
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

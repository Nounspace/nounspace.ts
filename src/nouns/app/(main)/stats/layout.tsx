import StatsNav from "@nouns/components/StatsNav";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Nouns.com Stats - Track Noun DAO and $nouns Metrics",
  description:
    "Stay updated with Nouns DAO stats. Track Nouns Treasury activity, proposal spending, circulating Nouns, and $nouns trading volume. Real-time insights, all in one place.",
};

export default function StatsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[880px] flex-col gap-4 p-6 pb-24 md:gap-6 md:p-10 md:pb-24">
      <h2>Stats</h2>
      <StatsNav />
      {children}
    </div>
  );
}

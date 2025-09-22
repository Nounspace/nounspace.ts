"use client";
import { useAuctionData } from "@nouns/hooks/useAuctionData";
import { CurrentAuctionLarge } from "@nouns/components/CurrentAuction";
import clsx from "clsx";
import FeatureHighlightCard from "@nouns/components/FeatureHighlightCard";

export default function JoinAuction() {
  const { noun } = useAuctionData();

  return (
    <FeatureHighlightCard
      href=""
      iconSrc="/feature/bid/icon.svg"
      buttonLabel="Bid"
      description="Bid on today's one-of-a-kind Noun and make it yours!"
      className={clsx(
        noun?.traits.background.seed == 1 ? "bg-nouns-warm" : "bg-nouns-cool",
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-4 px-8 pb-8 md:pb-10">
        <CurrentAuctionLarge />
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-[#A3EFD0] bg-green-600" />
          <span className="text-green-600 label-md">Live auction</span>
        </div>
      </div>
    </FeatureHighlightCard>
  );
}

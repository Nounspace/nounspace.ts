"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FeatureCard from "./FeatureCard";
import { useCallback } from "react";
import { INSTANT_SWAP_FILTER_KEY } from "../NounExplorer/NounFilter/InstantSwapFilter";
import { ONLY_TREASURY_NOUNS_FILTER_KEY } from "../NounExplorer/NounFilter/TreasuryNounFilter";
import { scrollToNounExplorer } from "@nouns/utils/scroll";

export default function FeatureHighlight() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handlePermissionlessSwapClick = useCallback(() => {
    const auctionId = searchParams.get("auctionId");
    const params = new URLSearchParams();

    // Clear all except auctionId
    params.set(INSTANT_SWAP_FILTER_KEY, "1");
    if (auctionId) {
      params.set("auctionId", auctionId);
    }

    // Add filter and scroll to explore
    window.history.pushState(null, "", `?${params.toString()}`);
    scrollToNounExplorer();
  }, [searchParams]);

  const handleTreasurySwapClick = useCallback(() => {
    const auctionId = searchParams.get("auctionId");
    const params = new URLSearchParams();

    // Clear all except auctionId
    params.set(ONLY_TREASURY_NOUNS_FILTER_KEY, "1");
    if (auctionId) {
      params.set("auctionId", auctionId);
    }

    // Add filter and scroll to explore
    window.history.pushState(null, "", `?${params.toString()}`);
    scrollToNounExplorer();
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <FeatureCard
        title="Permissionless Swaps"
        description="Easily swap your Nouns any time"
        cta="Swap"
        onCtaClick={() => handlePermissionlessSwapClick()}
        imgSrc="/feature/permissionless-swap.png"
        className="bg-[#E0E1C5]"
      />
      <FeatureCard
        title="Treasury Swaps"
        description="Trade your Noun for one in the treasury."
        cta="See Nouns"
        onCtaClick={() => handleTreasurySwapClick()}
        imgSrc="/feature/treasury-swap.png"
        className="bg-[#EDD4E4]"
      />
      <FeatureCard
        title="$NOUNS"
        description="Convert or redeem your Nouns for $nouns tokens."
        cta="Convert"
        onCtaClick={() => router.push("/convert")}
        imgSrc="/feature/nouns-erc20.png"
        className="bg-[#C5D7E1]"
      />
    </div>
  );
}

"use client";
import { BUY_NOW_FILTER_KEY } from "@nouns/components/NounExplorer/NounFilter/BuyNowFilter";
import { INSTANT_SWAP_FILTER_KEY } from "@nouns/components/NounExplorer/NounFilter/InstantSwapFilter";
import { ONLY_TREASURY_NOUNS_FILTER_KEY } from "@nouns/components/NounExplorer/NounFilter/TreasuryNounFilter";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface NounFilters {
  background: string[];
  head: string[];
  glasses: string[];
  body: string[];
  accessory: string[];
  heldByTreasury: boolean;
  heldByNounsErc20: boolean;
  buyNow: boolean;
  totalCount: number;
}

export function useNounFilters(): NounFilters {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const background = searchParams?.getAll("background[]") || [];
    const head = searchParams?.getAll("head[]") || [];
    const glasses = searchParams?.getAll("glasses[]") || [];
    const body = searchParams?.getAll("body[]") || [];
    const accessory = searchParams?.getAll("accessory[]") || [];
    const heldByTreasury = searchParams?.get(ONLY_TREASURY_NOUNS_FILTER_KEY) != null;
    const heldByNounsErc20 = searchParams?.get(INSTANT_SWAP_FILTER_KEY) != null;
    const buyNow = searchParams?.get(BUY_NOW_FILTER_KEY) != null;

    const totalCount =
      background.length +
      head.length +
      glasses.length +
      body.length +
      accessory.length +
      (heldByTreasury ? 1 : 0) +
      (heldByNounsErc20 ? 1 : 0) +
      (buyNow ? 1 : 0);

    return {
      background,
      head,
      glasses,
      body,
      accessory,
      heldByTreasury,
      heldByNounsErc20,
      buyNow,
      totalCount,
    };
  }, [searchParams]);
}

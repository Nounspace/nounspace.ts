"use client";
import { CHAIN_CONFIG } from "@nouns/config";
import { Noun } from "@nouns/data/noun/types";
import { useNounFilters } from "@nouns/hooks/useNounFilters";
import { useMemo } from "react";
import { isAddressEqual } from "viem";
import NounGrid from "./NounGrid/NounGrid";
import NounFilter from "./NounFilter";
import { ActiveFilters } from "./NounFilter/ActiveFilters";

interface NounExplorerProps {
  nouns: Noun[];
}

// Hardcoded:
// - Footer height: 0px
// - Filter height: 60px

export default function NounExplorer({ nouns }: NounExplorerProps) {
  const filters = useNounFilters();
  const filteredNouns = useMemo(() => {
    return nouns.filter((noun) => {
      const backgroundMatch =
        filters.background.length === 0 ||
        filters.background.includes(noun.traits.background.seed.toString());
      const headMatch =
        filters.head.length === 0 ||
        filters.head.includes(noun.traits.head.seed.toString());
      const glassesMatch =
        filters.glasses.length === 0 ||
        filters.glasses.includes(noun.traits.glasses.seed.toString());
      const bodyMatch =
        filters.body.length === 0 ||
        filters.body.includes(noun.traits.body.seed.toString());
      const accessoryMatch =
        filters.accessory.length === 0 ||
        filters.accessory.includes(noun.traits.accessory.seed.toString());
      const treasuryNounMatch =
        !filters.heldByTreasury ||
        isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsTreasury);
      const instantSwapMatch =
        !filters.heldByNounsErc20 ||
        isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsErc20);
      const buyNowMatch = !filters.buyNow || noun.secondaryListing != undefined;

      return (
        backgroundMatch &&
        headMatch &&
        glassesMatch &&
        bodyMatch &&
        accessoryMatch &&
        treasuryNounMatch &&
        instantSwapMatch &&
        buyNowMatch
      );
    });
  }, [filters, nouns]);

  return (
    <div
      className="flex w-full flex-col md:flex-row md:gap-8"
      id="explore-section"
    >
      {/* Moved this inside NounFilter avoid stacking context issue with new mobile nav */}
      {/* <div className="sticky top-0 z-[10] flex max-h-[100dvh] min-h-[60px] shrink-0 md:h-auto md:pb-[0px]"> */}
      <NounFilter />
      {/* </div> */}
      <div className="flex min-w-0 flex-[2] flex-col">
        <div className="sticky top-[63px] z-[8]">
          <ActiveFilters numNouns={filteredNouns.length} />
        </div>
        <div className="min-h-[calc(100dvh-108px)] overflow-hidden md:min-h-[calc(100vh-64px)]">
          <NounGrid nouns={filteredNouns} />
        </div>
      </div>
    </div>
  );
}

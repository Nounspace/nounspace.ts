"use client";
import { NounTrait, NounTraitType } from "@nouns/data/noun/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ONLY_TREASURY_NOUNS_FILTER_KEY } from "./TreasuryNounFilter";
import { X } from "lucide-react";
import { ACCESSORY_TRAITS, BACKGROUND_TRAITS, BODY_TRAITS, GLASSES_TRAITS, HEAD_TRAITS } from ".";
import { INSTANT_SWAP_FILTER_KEY } from "./InstantSwapFilter";
import { useNounFilters } from "@nouns/hooks/useNounFilters";
import clsx from "clsx";
import { scrollToNounExplorer } from "@nouns/utils/scroll";
import { BUY_NOW_FILTER_KEY } from "./BuyNowFilter";

export function ActiveFilters({ numNouns }: { numNouns: number }) {
  const { background, head, glasses, body, accessory, heldByTreasury, heldByNounsErc20, buyNow, totalCount } =
    useNounFilters();

  return (
    <div className={clsx("flex items-center gap-2 bg-white md:py-4", totalCount > 0 ? "py-2" : "py-0")}>
      <h5 className="hidden md:flex">Filters</h5>
      <div className="bg-background-secondary text-content-secondary label-sm mr-2 hidden h-6 w-6 items-center justify-center rounded-[4px] md:flex">
        {totalCount}
      </div>
      <div className="no-scrollbar flex w-full min-w-0 flex-row items-center gap-2 overflow-x-auto">
        {heldByTreasury && <ActiveFilterItem seed={"1"} type="heldByTreasury" key={"heldByTreasury"} />}
        {heldByNounsErc20 && <ActiveFilterItem seed={"1"} type="heldByNounsErc20" key={"heldByNounsErc20"} />}
        {buyNow && <ActiveFilterItem seed={"1"} type="buyNow" key={"buyNow"} />}
        {background.map((seed) => (
          <ActiveFilterItem seed={seed} type="background" key={"background" + seed} />
        ))}
        {head.map((seed) => (
          <ActiveFilterItem seed={seed} type="head" key={"head" + seed} />
        ))}
        {glasses.map((seed) => (
          <ActiveFilterItem seed={seed} type="glasses" key={"glasses" + seed} />
        ))}
        {body.map((seed) => (
          <ActiveFilterItem seed={seed} type="body" key={"body" + seed} />
        ))}
        {accessory.map((seed) => (
          <ActiveFilterItem seed={seed} type="accessory" key={"accessory" + seed} />
        ))}
      </div>
      <h6 className="hidden shrink-0 pl-4 md:flex">{numNouns} nouns</h6>
    </div>
  );
}

interface ActiveFilterItemInterface {
  type: NounTraitType | "heldByNounsErc20" | "heldByTreasury" | "buyNow";
  seed: string;
}

function ActiveFilterItem({ type, seed }: ActiveFilterItemInterface) {
  const searchParams = useSearchParams();

  const removeFilter = useCallback(
    (type: ActiveFilterItemInterface["type"], seed: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

      if (type == "heldByTreasury") {
        if (params.get(ONLY_TREASURY_NOUNS_FILTER_KEY) === "1") {
          params.delete(ONLY_TREASURY_NOUNS_FILTER_KEY);
          window.history.pushState(null, "", `?${params.toString()}`);
        }
      } else if (type == "heldByNounsErc20") {
        if (params.get(INSTANT_SWAP_FILTER_KEY) === "1") {
          params.delete(INSTANT_SWAP_FILTER_KEY);
          window.history.pushState(null, "", `?${params.toString()}`);
        }
      } else if (type == "buyNow") {
        if (params.get(BUY_NOW_FILTER_KEY) === "1") {
          params.delete(BUY_NOW_FILTER_KEY);
          window.history.pushState(null, "", `?${params.toString()}`);
        }
      } else {
        const filterKey = type + "[]";
        const traitFilterParams = params.getAll(filterKey);

        const index = traitFilterParams.indexOf(seed.toString());
        if (index !== -1) {
          // Remove seed
          traitFilterParams.splice(index, 1);

          // Replace params
          params.delete(filterKey);
          traitFilterParams.forEach((value) => {
            params.append(filterKey, value);
          });

          window.history.pushState(null, "", `?${params.toString()}`);
        }
      }
      scrollToNounExplorer();
    },
    [searchParams]
  );

  return (
    <button
      onClick={() => removeFilter(type, seed)}
      className="bg-background-secondary text-content-secondary label-sm flex items-center justify-center whitespace-pre rounded-[9px] px-[10px] py-2 hover:brightness-95"
    >
      {type === "heldByTreasury" ? (
        <span className="text-content-primary">Treasury Nouns</span>
      ) : type === "heldByNounsErc20" ? (
        <span className="text-content-primary">Instant Swap</span>
      ) : type === "buyNow" ? (
        <span className="text-content-primary">Buy Now</span>
      ) : (
        <>
          <span>{type}: </span>
          <span className="text-content-primary">{getNameForTrait(type, seed)}</span>
        </>
      )}
      <X size={16} strokeWidth={3} className="stroke-content-secondary ml-2" />
    </button>
  );
}

function getNameForTrait(traitType: NounTraitType, seed: string) {
  let traits: NounTrait[] = [];

  switch (traitType) {
    case "background":
      traits = BACKGROUND_TRAITS;
      break;
    case "head":
      traits = HEAD_TRAITS;
      break;
    case "glasses":
      traits = GLASSES_TRAITS;
      break;
    case "body":
      traits = BODY_TRAITS;
      break;
    case "accessory":
      traits = ACCESSORY_TRAITS;
      break;
  }

  return traits.find((trait) => trait.seed === parseInt(seed))?.name;
}

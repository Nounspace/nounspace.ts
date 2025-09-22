"use client";
import NounCard from "../../NounCard";
import { useMemo } from "react";
import { Noun } from "@nouns/data/noun/types";
import AnimationGird from "./AnimationGrid";
import { LinkShallow } from "../../ui/link";
import { ClearAllFiltersButton } from "../NounFilter/ClearAllFiltersButton";

interface NounGridInterface {
  nouns: Noun[];
}

export default function NounGrid({ nouns }: NounGridInterface) {
  const nounCards = useMemo(() => {
    return nouns.map((noun, i) => ({
      element: (
        <LinkShallow
          searchParam={{ name: "nounId", value: noun.id }}
          key={i}
          className="block aspect-square h-full w-full"
        >
          <NounCard noun={noun} enableHover key={i} lazyLoad />
        </LinkShallow>
      ) as React.ReactNode,
      id: Number(noun.id),
    }));
  }, [nouns]);

  return (
    <div className="relative w-full pb-24 pt-[8px] md:pt-0">
      {nounCards.length == 0 ? (
        <div className="flex h-fit grow flex-col items-center justify-center gap-2 rounded-3xl border-4 border-gray-200 px-4 py-24 text-center">
          <h4>No Nouns found.</h4>
          <ClearAllFiltersButton className="text-semantic-accent heading-6 clickable-active">
            Clear all filters
          </ClearAllFiltersButton>
        </div>
      ) : (
        <AnimationGird items={nounCards} />
      )}
    </div>
  );
}

"use client";
import { NounTrait, NounTraitType } from "@nouns/data/noun/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { FilterItemButton } from "./FilterItemButton";
import { scrollToNounExplorer } from "@nouns/utils/scroll";
import Image from "next/image";
import { buildNounTraitImage } from "@nouns/utils/nounImages/nounImage";
import { useInView } from "framer-motion";
import { Skeleton } from "@nouns/components/ui/skeleton";

export interface FilterTraitItemProps {
  traitType: NounTraitType;
  trait: NounTrait;
}

export function FilterTraitItem({ traitType, trait }: FilterTraitItemProps) {
  const searchParams = useSearchParams();

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { margin: "500px 0px" });

  const filterKey = useMemo(() => traitType + "[]", [traitType]);

  const isChecked = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const traitFilterParams = params.getAll(filterKey);
    return traitFilterParams.includes(trait.seed.toString());
  }, [searchParams, filterKey, trait.seed]);

  const handleCheckChange = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const traitFilterParams = params.getAll(filterKey);

      const index = traitFilterParams.indexOf(trait.seed.toString());
      if (checked && index === -1) {
        traitFilterParams.push(trait.seed.toString());
      } else if (!checked && index !== -1) {
        traitFilterParams.splice(index, 1);
      } else {
        // No work to do
        return;
      }

      params.delete(filterKey);

      // Re-add the updated values to the URLSearchParams
      traitFilterParams.forEach((value) => {
        params.append(filterKey, value);
      });

      window.history.pushState(null, "", `?${params.toString()}`);
      scrollToNounExplorer();
    },
    [searchParams, filterKey, trait.seed],
  );

  const traitImg = buildNounTraitImage(traitType, trait.seed);

  return (
    <FilterItemButton
      isChecked={isChecked}
      onClick={() => handleCheckChange(!isChecked)}
    >
      <div className="flex items-center gap-2" ref={ref}>
        {isInView ? (
          <Image src={traitImg} width={32} height={32} alt={trait.name} />
        ) : (
          <Skeleton className="h-8 w-8" />
        )}
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap pr-2">
          {trait.name}
        </span>
      </div>
    </FilterItemButton>
  );
}

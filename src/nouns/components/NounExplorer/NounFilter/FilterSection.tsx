"use client";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nouns/components/ui/accordion";
import { Input } from "../../ui/input";
import { FilterTraitItem } from "./FilterTraitItem";
import { NounTrait, NounTraitType } from "@nouns/data/noun/types";
import { capitalizeFirstLetterOfEveryWord } from "@nouns/utils/format";
import { useMemo, useState } from "react";

const MIN_TRAITS_FOR_SEARCH = 5;

interface FilterSectionProps {
  traitType: NounTraitType;
  traits: NounTrait[];
}

export function FilterSection({ traitType, traits }: FilterSectionProps) {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const filteredTraits = useMemo(() => {
    return traits.filter((trait) =>
      trait.name.toLowerCase().includes(searchFilter.toLowerCase()),
    );
  }, [traits, searchFilter]);

  return (
    <AccordionItem value={traitType}>
      <AccordionTrigger className="heading-6">
        {capitalizeFirstLetterOfEveryWord(traitType)}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-2">
        {traits.length > MIN_TRAITS_FOR_SEARCH && (
          <Input
            placeholder="Search"
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.target.value)}
            className="focus-visible:ring-0"
          />
        )}
        <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
          {filteredTraits.length > 0 ? (
            filteredTraits.map((trait) => (
              <FilterTraitItem
                traitType={traitType}
                trait={trait}
                key={traitType + trait.seed}
              />
            ))
          ) : (
            <div className="flex w-full items-center justify-center text-content-secondary">
              No results.
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

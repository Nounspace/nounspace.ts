"use client";
import { Accordion } from "@nouns/components/ui/accordion";
import { NounTrait } from "@nouns/data/noun/types";
import { capitalizeFirstLetterOfEveryWord } from "@nouns/utils/format";
import { FilterSection } from "./FilterSection";
import { Separator } from "../../ui/separator";
import TreasuryNounFilter from "./TreasuryNounFilter";
import { ClearAllFiltersButton } from "./ClearAllFiltersButton";
import { cn } from "@nouns/utils/shadcn";
import InstantSwapFilter from "./InstantSwapFilter";
import BuyNowFilter from "./BuyNowFilter";
import Icon from "@nouns/components/ui/Icon";
import { DrawerTrigger, Drawer, DrawerContent } from "@nouns/components/ui/drawer";
import { Button } from "@nouns/components/ui/button";
import { useState } from "react";
import { DrawerDialogContentInner } from "@nouns/components/ui/DrawerDialog";
import { imageData } from "@nouns/utils/nounImages/imageData";
import { useNounFilters } from "@nouns/hooks/useNounFilters";

export const BACKGROUND_TRAITS: NounTrait[] = [
  { name: "Cool", seed: 0 },
  { name: "Warm", seed: 1 },
];

export const GLASSES_TRAITS: NounTrait[] = imageData.images.glasses.map(
  (item, i) => ({
    name: capitalizeFirstLetterOfEveryWord(
      item.filename
        .substring(item.filename.indexOf("-") + 1)
        .split("-")
        .join(" "),
    ),
    seed: i,
  }),
);

export const HEAD_TRAITS: NounTrait[] = imageData.images.heads.map(
  (item, i) => ({
    name: capitalizeFirstLetterOfEveryWord(
      item.filename
        .substring(item.filename.indexOf("-") + 1)
        .split("-")
        .join(" "),
    ),
    seed: i,
  }),
);

export const BODY_TRAITS: NounTrait[] = imageData.images.bodies.map(
  (item, i) => ({
    name: capitalizeFirstLetterOfEveryWord(
      item.filename
        .substring(item.filename.indexOf("-") + 1)
        .split("-")
        .join(" "),
    ),
    seed: i,
  }),
);

export const ACCESSORY_TRAITS: NounTrait[] = imageData.images.accessories.map(
  (item, i) => ({
    name: capitalizeFirstLetterOfEveryWord(
      item.filename
        .substring(item.filename.indexOf("-") + 1)
        .split("-")
        .join(" "),
    ),
    seed: i,
  }),
);

export default function NounFilter() {
  const [open, setOpen] = useState<boolean>(false);
  const { totalCount } = useNounFilters();
  return (
    <>
      {/* Desktop */}
      <div className="sticky top-[60px] z-[10] hidden h-auto max-h-[100dvh] min-h-[60px] max-w-[280px] shrink-0 overflow-y-auto pb-[0px] md:flex">
        <FilterMenu />
      </div>

      {/* Mobile  */}
      <div className="md:hidden">
        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerTrigger asChild>
            <button className="fixed bottom-[84px] left-1/2 z-10 flex h-12 -translate-x-1/2 items-center justify-center gap-2.5 rounded-full bg-content-primary px-6 font-bold text-white hover:bg-content-primary/90 md:hidden pwa:bottom-[104px]">
              <Icon icon="filter" size={24} className="fill-white" />
              <span>Filters ({totalCount})</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerDialogContentInner className="p-0">
              <div className="flex min-h-0 flex-col overflow-y-auto px-6 pt-6">
                <FilterMenu />
              </div>
              <div className="flex w-full shrink-0 justify-between overflow-hidden bg-white px-6 py-2 shadow-top-only">
                <ClearAllFiltersButton className="text-semantic-accent clickable-active">
                  Clear all
                </ClearAllFiltersButton>
                <Button
                  className="w-fit md:hidden"
                  onClick={() => setOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </DrawerDialogContentInner>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

function FilterMenu() {
  return (
    <div className={cn("relative flex h-full w-full flex-col gap-2")}>
      <div className="flex w-full items-center justify-between bg-white md:pt-3">
        <h3>Filter</h3>
        <ClearAllFiltersButton className="hidden text-semantic-accent clickable-active md:flex">
          Clear all
        </ClearAllFiltersButton>
      </div>
      <Separator className="h-[2px]" />
      <div>
        <BuyNowFilter />
        <span className="text-content-secondary paragraph-sm">
          Show Nouns that are listed on secondary that you can buy now.
        </span>
      </div>
      <Separator className="h-[2px]" />
      <div>
        <InstantSwapFilter />
        <span className="text-content-secondary paragraph-sm">
          Show Nouns available for instant Swap via $nouns.
        </span>
      </div>
      <Separator className="h-[2px]" />
      <div>
        <TreasuryNounFilter />
        <span className="text-content-secondary paragraph-sm">
          Show Nouns held by the Treasury you can create a swap offer for.
        </span>
      </div>
      <Accordion type="multiple">
        <FilterSection traitType="background" traits={BACKGROUND_TRAITS} />
        <FilterSection traitType="glasses" traits={GLASSES_TRAITS} />
        <FilterSection traitType="head" traits={HEAD_TRAITS} />
        <FilterSection traitType="body" traits={BODY_TRAITS} />
        <FilterSection traitType="accessory" traits={ACCESSORY_TRAITS} />
      </Accordion>
    </div>
  );
}

import { SecondaryNounOffer } from "@nouns/data/noun/types";
import { formatNumber } from "@nouns/utils/format";
import Image from "next/image";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@nouns/components/ui/DrawerDialog";

interface NounsFloorProps {
  offer: SecondaryNounOffer | null;
}

export default function SecondaryTopOffer({ offer }: NounsFloorProps) {
  if (!offer) return null;

  return (
    <DrawerDialog>
      <DrawerDialogTrigger className="underline label-sm hover:text-content-primary">
        Top offer: {formatNumber({ input: offer.priceEth, unit: "ETH" })}
      </DrawerDialogTrigger>
      <DrawerDialogContent className="md:max-w-[min(420px,95%)]">
        <DrawerDialogContentInner className="gap-6">
          <DrawerDialogTitle className="w-full heading-4">
            Top Offer
          </DrawerDialogTitle>
          <div className="flex h-[92px] w-full items-start justify-between gap-3 rounded-xl border-2 border-border-secondary p-4 font-pt font-bold">
            <div className="flex flex-col gap-1">
              <span className="text-[28px] leading-[36px]">
                {formatNumber({ input: offer.priceEth, unit: "ETH" })}
              </span>
              {offer.priceUsd && (
                <span className="text-content-secondary label-sm">
                  {formatNumber({ input: offer.priceUsd, unit: "USD" })}
                </span>
              )}
            </div>
            {offer.marketIcon && (
              <Image
                src={offer.marketIcon ?? ""}
                width={36}
                height={36}
                alt={offer.marketName ?? ""}
              />
            )}
          </div>
          <div className="w-full">
            The highest offer to buy a Noun across all secondary marketplaces.
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

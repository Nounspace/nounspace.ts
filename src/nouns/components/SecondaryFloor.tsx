import { SecondaryNounListing } from "@nouns/data/noun/types";
import Icon from "./ui/Icon";
import { LinkShallow } from "./ui/link";
import { formatTokenAmount } from "@nouns/utils/utils";
import clsx from "clsx";
import { TooltipPopover } from "./ui/tooltipPopover";

interface NounsFloorProps {
  listing: SecondaryNounListing | null;
  redThreshold?: bigint;
}

export default function SecondaryFloor({ listing, redThreshold }: NounsFloorProps) {
  if (!listing) return null;

  return (
    <div className="flex gap-2">
      <TooltipPopover trigger={<Icon icon="circleInfo" size={18} className="fill-content-secondary" />}>
        The lowest price of all Nouns listed on the secondary market.
      </TooltipPopover>
      <LinkShallow
        searchParam={{ name: "nounId", value: listing.nounId }}
        className="label-sm text-content-secondary hover:text-content-primary whitespace-pre underline"
      >
        Floor<span className="hidden md:inline"> price</span>:{" "}
        <span className={clsx(redThreshold && BigInt(listing.priceRaw) < redThreshold && "text-semantic-negative")}>
          {formatTokenAmount(BigInt(listing.priceRaw), 18)} ETH
        </span>
      </LinkShallow>
    </div>
  );
}

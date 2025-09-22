"use client";
import { Noun } from "@nouns/data/noun/types";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useMemo, useRef } from "react";
import { CHAIN_CONFIG } from "@nouns/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useInView } from "framer-motion";
import { useNounImage } from "@nouns/hooks/useNounImage";
import Icon from "./ui/Icon";
import clsx from "clsx";
import { formatTokenAmount } from "@nouns/utils/utils";
import { isAddressEqual } from "viem";

interface NounCardProps {
  noun: Noun;
  size?: number;
  enableHover: boolean;
  alwaysShowNumber?: boolean;
  lazyLoad?: boolean;
}

export default function NounCard({
  noun,
  size,
  enableHover,
  alwaysShowNumber,
  lazyLoad,
}: NounCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: "500px 0px" });
  const isTreasuryNoun = useMemo(
    () => noun.owner == CHAIN_CONFIG.addresses.nounsTreasury,
    [noun.owner],
  );
  const isHeldByNounsErc20 = useMemo(
    () => noun.owner == CHAIN_CONFIG.addresses.nounsErc20,
    [noun.owner],
  );

  const isAuctionNoun = useMemo(() => {
    return isAddressEqual(
      CHAIN_CONFIG.addresses.nounsAuctionHouseProxy,
      noun.owner,
    );
  }, [noun.owner]);

  const nounImage = useNounImage("full", noun);

  return (
    <div
      className={twMerge(
        "group relative flex aspect-square justify-center overflow-hidden rounded-2xl bg-transparent",
        size && size <= 100 && "rounded-xl",
        size && size <= 50 && "rounded-lg",
      )}
      ref={ref}
    >
      {!isInView && lazyLoad ? (
        <div className="aspect-square bg-background-secondary" />
      ) : (
        <>
          <Image
            src={nounImage ?? "/noun-loading-skull.gif"}
            fill={size == undefined}
            width={size}
            height={size}
            alt="Noun"
            className="object-contain outline outline-4 outline-transparent"
            unoptimized={nounImage == undefined}
            draggable={false}
          />
          <h6
            className={twMerge(
              "absolute bottom-[8px] hidden rounded-full bg-white px-3 py-0.5 text-content-primary shadow-lg",
              size && size <= 100 && "bottom-[4px] px-2 text-sm",
              enableHover && "group-hover:block",
              alwaysShowNumber && "block",
            )}
          >
            {noun.id}
          </h6>
          {isTreasuryNoun && enableHover && (
            <Tooltip>
              <TooltipTrigger className="absolute left-2 top-2 z-[6]" asChild>
                <div className="rounded-full bg-white p-[5px] shadow-md">
                  <Icon icon="treasury" size={size ? size / 10 : 20} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                This Noun is held by the treasury. <br />
                You can create a swap offer for this Noun.
              </TooltipContent>
            </Tooltip>
          )}
          {isHeldByNounsErc20 && enableHover && (
            <Tooltip>
              <TooltipTrigger className="absolute left-2 top-2 z-[6]" asChild>
                <div className="flex items-center gap-1 rounded-full bg-white px-2 py-[5px] shadow-md">
                  <Icon icon="swap" size={size ? size / 10 : 20} />
                  <span className="text-content-primary label-sm">Swap</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                This Noun is held by the $nouns ERC-20 contract. It can be
                instantly swapped with any Noun you own.
              </TooltipContent>
            </Tooltip>
          )}
          {noun.secondaryListing && enableHover && (
            <Tooltip>
              <TooltipTrigger className="absolute right-2 top-2 z-[6]" asChild>
                <div className="flex items-center gap-1 rounded-full bg-[#212529]/40 py-[5px] pl-1.5 pr-2 text-center text-white backdrop-blur-[2px] label-sm">
                  <Image
                    src="/ethereum-logo.png"
                    width={20}
                    height={20}
                    alt="Ξ"
                  />
                  <span>
                    {formatTokenAmount(
                      BigInt(noun.secondaryListing.priceRaw),
                      18,
                    )}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                This Noun is listed on the secondary market.
              </TooltipContent>
            </Tooltip>
          )}
          {isAuctionNoun && enableHover && (
            <Tooltip>
              <TooltipTrigger
                className="absolute left-2 top-2 z-[6] font-bold text-white label-sm"
                asChild
              >
                <div className="flex items-center justify-center gap-[7px] rounded-full bg-background-dark py-2 pl-3 pr-4 shadow-md">
                  <div className="h-2 w-2 rounded-full bg-green-200 shadow-[0px_-1px_4px_0px_#26CB7E8C]" />
                  Bid
                </div>
              </TooltipTrigger>
              <TooltipContent>
                This Noun is currently on auction.
                <br />
                You can create a bid to win it!
              </TooltipContent>
            </Tooltip>
          )}
          <div
            className={clsx(
              "z-[2] hidden h-full w-full rounded-[inherit] shadow-[inset_0_0_0_4px_rgba(0,0,0,1)]",
              enableHover && "group-hover:block",
            )}
          />
        </>
      )}
    </div>
  );
}

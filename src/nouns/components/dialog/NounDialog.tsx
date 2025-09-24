"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { Noun, NounTraitType, SecondaryNounListing } from "@nouns/data/noun/types";
import { Separator } from "../ui/separator";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAIN_CONFIG } from "@nouns/config";
import Link from "next/link";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useNounImage } from "@nouns/hooks/useNounImage";
import Icon from "../ui/Icon";
import { scrollToNounExplorer } from "@nouns/utils/scroll";
import { formatTokenAmount } from "@nouns/utils/utils";
import { formatNumber } from "@nouns/utils/format";
import NounsFloor from "../SecondaryFloor";
import BuyNounOnSecondaryDialog from "./BuyNounOnSecondaryDialog";
import { Avatar, Name } from "@paperclip-labs/whisk-sdk/identity";
import { LinkExternal } from "../ui/link";
import { useQuery } from "@tanstack/react-query";
import { currentAuctionIdQuery, nogsQuery } from "@nouns/data/tanstackQueries";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
} from "../ui/DrawerDialog";
import { isAddressEqual } from "viem";

interface NounsDialogProps {
  nouns: Noun[];
  secondaryFloorListing: SecondaryNounListing | null;
}

export default function NounDialog({
  nouns,
  secondaryFloorListing,
}: NounsDialogProps) {
  const searchParams = useSearchParams();
  const nounId = searchParams?.get("nounId");

  const [noun, setNoun] = useState<Noun | undefined>();

  useEffect(() => {
    if (nounId) {
      setNoun(nouns.find((noun) => noun.id === nounId));
    } else {
      // Latch the selected Noun so we can have a nice exit animation
    }
  }, [nouns, nounId]);

  const { data: nogsValue } = useQuery({
    ...nogsQuery(nounId!),
    enabled: !!nounId,
  });

  const fullImageData = useNounImage("full", noun);

  function handleOpenChange(open: boolean) {
    if (!open) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete("nounId");
      window.history.pushState(null, "", `?${params.toString()}`);
    }
  }

  const heldByTreasury = useMemo(() => {
    return noun?.owner == CHAIN_CONFIG.addresses.nounsTreasury;
  }, [noun]);

  const heldByNounsErc20 = useMemo(() => {
    return noun?.owner == CHAIN_CONFIG.addresses.nounsErc20;
  }, [noun]);

  const isAuctionNoun = useMemo(() => {
    return (
      noun &&
      isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsAuctionHouseProxy)
    );
  }, [noun]);

  if (!noun) {
    return null;
  }

  return (
    <DrawerDialog open={nounId != undefined} onOpenChange={handleOpenChange}>
      <DrawerDialogContent
        className={clsx(
          "md:aspect-[100/45] md:max-w-[min(95vw,1400px)]",
          noun.traits.background.seed == 1 ? "bg-nouns-warm" : "bg-nouns-cool",
        )}
      >
        <DrawerDialogContentInner className={clsx("p-0 md:flex-row")}>
          <DrawerDialogTitle className="w-full pl-6 pt-6 heading-1 md:hidden">
            Noun {noun.id}
          </DrawerDialogTitle>
          <Image
            src={fullImageData ?? "/noun-loading-skull.gif"}
            width={600}
            height={600}
            alt="Noun"
            unoptimized={fullImageData == undefined}
            className="flex aspect-square h-fit max-h-[400px] w-full max-w-[min(70%,400px)] shrink-0 justify-center object-contain object-bottom md:h-full md:max-h-none md:w-[45%] md:max-w-none"
          />

          <div className="flex w-full flex-auto flex-col gap-6 overflow-visible px-6 pb-6 scrollbar-track-transparent md:h-full md:overflow-y-auto md:px-8 md:pt-12">
            <h2 className="hidden md:block">Noun {noun.id}</h2>
            <Separator className="h-[2px]" />

            <LinkExternal
              className="flex min-w-0 items-center gap-2 hover:brightness-75"
              href={`${CHAIN_CONFIG.chain.blockExplorers?.default.url}/address/${noun.owner}`}
            >
              <div className="flex w-fit max-w-full items-center gap-6">
                <Avatar address={noun.owner} size={36} />
                <div className="flex h-full min-w-0 flex-col justify-start overflow-hidden label-md">
                  <span className="text-content-secondary paragraph-sm">
                    Held by
                  </span>
                  <Name address={noun.owner} />
                </div>
              </div>
            </LinkExternal>

            {heldByTreasury && (
              <>
                <Link href={`/treasury-swap/${noun.id}`}>
                  <Button className="w-full">Create a swap offer</Button>
                </Link>
                <div className="text-content-secondary">
                  You can create a swap offer proposal for this Noun.
                </div>
              </>
            )}

            {heldByNounsErc20 && (
              <>
                <Link href={`/instant-swap/${noun.id}`}>
                  <Button className="w-full gap-[10px]">
                    <Icon icon="swap" size={20} className="fill-white" />
                    Instant swap
                  </Button>
                </Link>
                <div className="text-content-secondary">
                  This Noun can be instantly swapped with any Noun you own. No
                  need for a proposal because its held in the $nouns contract.
                  Just swap it.
                </div>
              </>
            )}

            {noun.secondaryListing && (
              <>
                <div className="flex flex-col gap-6 rounded-[20px] bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-content-secondary label-md">
                        List Price
                      </span>
                      <span className="font-pt text-[28px] font-bold leading-[36px] text-content-primary">
                        {formatTokenAmount(
                          BigInt(noun.secondaryListing.priceRaw),
                          18,
                        )}{" "}
                        ETH
                      </span>
                      {noun.secondaryListing.priceUsd && (
                        <span className="text-content-secondary label-sm">
                          {formatNumber({
                            input: noun.secondaryListing.priceUsd,
                            unit: "USD",
                          })}
                        </span>
                      )}
                    </div>
                    <Image
                      src={noun.secondaryListing.marketIcon ?? ""}
                      width={36}
                      height={36}
                      alt={noun.secondaryListing.marketName ?? ""}
                    />
                  </div>
                  <NounsFloor listing={secondaryFloorListing} />
                  <BuyNounOnSecondaryDialog noun={noun} />
                </div>
                <div className="text-content-secondary">
                  Buy this Noun instantly from the secondary market via
                  Nouns.com with no additional fees!
                </div>
              </>
            )}

            {isAuctionNoun && (
              <>
                <Link href="/">
                  <Button className="w-full gap-[10px]">
                    <Icon icon="bid" size={20} className="fill-white" />
                    Bid
                  </Button>
                </Link>
                <div className="text-content-secondary">
                  This Noun is currently on auction. Bid now to win it!
                </div>
              </>
            )}

            <Separator className="h-[2px]" />

            <div className="flex flex-col gap-4">
              <h5>Traits</h5>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <NounTraitCard type="head" noun={noun} />
                <NounTraitCard type="glasses" noun={noun} />
                <NounTraitCard type="body" noun={noun} />
                <NounTraitCard type="accessory" noun={noun} />
                <NounTraitCard type="background" noun={noun} />
              </div>
            </div>

            <Separator className="h-[2px]" />

            <div className="flex flex-col gap-4">
              <h5>Info</h5>
              <LinkExternal
                href={`https://app.noggles.com/reward/eth/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03/${nounId}`}
                className="flex w-fit items-center gap-2.5 rounded-lg bg-black/5 p-2 label-sm hover:bg-black/10 hover:brightness-100"
              >
                <Image src="/nogs.png" width={24} height={24} alt="" />
                <span>
                  $NOGS:{" "}
                  {nogsValue != null && nogsValue != undefined
                    ? formatNumber({ input: nogsValue })
                    : "-"}
                </span>
              </LinkExternal>
            </div>

            <Separator className="h-[2px]" />

            <span className="text-content-secondary paragraph-sm">
              One Noun, Every Day, Forever.
            </span>
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

function NounTraitCard({ type, noun }: { type: NounTraitType; noun?: Noun }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const traitImage = useNounImage(type, noun);
  const trait = noun?.traits[type];

  const handleClick = useCallback(() => {
    if (trait) {
      const currentParams = new URLSearchParams(searchParams?.toString() || '');
      const params = new URLSearchParams();
      const filterKey = type + "[]";

      // Remove all filters but this one, also will close the card since removing nounId
      params.set(filterKey, trait.seed.toString());

      // Keep auctionId
      const auctionId = currentParams.get("auctionId");
      if (auctionId) {
        params.set("auctionId", auctionId);
      }

      if (pathname == "/explore") {
        window.history.pushState(null, "", `?${params.toString()}`);
      } else {
        // Navigate to explore page if not there already
        router.push(`/explore?${params.toString()}`);
      }

      // Scroll explore section into view
      scrollToNounExplorer();
    }
  }, [type, trait, searchParams, pathname, router]);

  return (
    <button
      className="flex justify-start gap-4 rounded-xl bg-black/5 p-2 text-start clickable-active hover:bg-black/10"
      onClick={() => handleClick()}
    >
      {traitImage ? (
        <Image
          src={traitImage}
          width={48}
          height={48}
          alt="Noun Trait"
          className="h-12 w-12 rounded-lg"
        />
      ) : (
        <Skeleton className="h-12 w-12 rounded-lg" />
      )}
      <div className="flex flex-col">
        <span className="text-content-secondary paragraph-sm">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <span className="label-md">
          {trait?.name
            ?.split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </span>
      </div>
    </button>
  );
}

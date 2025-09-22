"use client";

import { useActivitySelector } from "@nouns/components/selectors/ActivitySelector";
import TitlePopover from "@nouns/components/TitlePopover";
import Card from "@nouns/components/ui/card";
import Icon from "@nouns/components/ui/Icon";
import { LinkExternal } from "@nouns/components/ui/link";
import { CHAIN_CONFIG } from "@nouns/config";
import { Noun } from "@nouns/data/noun/types";
import { ActivityEntry } from "@nouns/data/ponder/activity/getActivity";
import { useNounImage } from "@nouns/hooks/useNounImage";
import { formatNumber, formatTimeSinceNow } from "@nouns/utils/format";
import Image from "next/image";
import { useMemo } from "react";
import { Address, getAddress } from "viem";
import Identity from "@nouns/components/Identity";

interface ActivityStatsProps {
  data: ActivityEntry[];
  nouns: Noun[];
  swappableNounCount: number;
}

export default function ActivityStats({
  data,
  nouns,
  swappableNounCount,
}: ActivityStatsProps) {
  const activitySelector = useActivitySelector();
  const swapCount = data.reduce(
    (acc, entry) => (entry.type == "swap" ? acc + 1 : acc),
    0,
  );

  const filteredData = useMemo(() => {
    switch (activitySelector) {
      case "all":
        return data;
      case "swap":
        return data.filter((entry) => entry.type === "swap");
      case "deposit":
        return data.filter((entry) => entry.type === "deposit");
      case "redeem":
        return data.filter((entry) => entry.type === "redeem");
    }
  }, [data, activitySelector]);
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex flex-col">
          <TitlePopover title="Total Swaps">
            Total number of swaps via $nouns.
          </TitlePopover>
          <span className="label-lg">
            {formatNumber({ input: swapCount, maxFractionDigits: 0 })}
          </span>
        </Card>
        <Card className="flex flex-col">
          <TitlePopover title="Swappable Nouns">
            Current number of swappable Nouns in the $nouns contract.
          </TitlePopover>
          <span className="label-lg">{swappableNounCount}</span>
        </Card>
      </div>
      <div className="flex flex-col">
        {filteredData.map((entry, i) => {
          return (
            <LinkExternal
              key={i}
              className="rounded-lg px-4 py-2 hover:bg-background-secondary hover:brightness-100"
              href={
                CHAIN_CONFIG.chain.blockExplorers?.default.url +
                `/tx/${entry.transaction?.hash}`
              }
            >
              {entry.type === "swap" ? (
                <SwapActivity
                  swapper={getAddress(entry.swapperAccountAddress)}
                  inputNoun={
                    nouns.find((nouns) => nouns.id == entry.fromNounsNftId)!
                  }
                  outputNoun={
                    nouns.find((nouns) => nouns.id == entry.toNounsNftId)!
                  }
                  timestamp={Number(entry.transaction?.timestamp)}
                />
              ) : entry.type === "deposit" ? (
                <DepositActivity
                  depositor={getAddress(entry.depositorAccountAddress)}
                  noun={nouns.find((noun) => noun.id == entry.nounsNftId)!}
                  timestamp={Number(entry.transaction?.timestamp)}
                />
              ) : (
                <RedeemActivity
                  noun={nouns.find((noun) => noun.id == entry.nounsNftId)!}
                  redeemer={getAddress(entry.redeemerAccountAddress)}
                  timestamp={Number(entry.transaction?.timestamp)}
                />
              )}
            </LinkExternal>
          );
        })}
      </div>
    </>
  );
}

function RedeemActivity({
  redeemer,
  noun,
  timestamp,
}: {
  redeemer: Address;
  noun: Noun;
  timestamp: Number;
}) {
  const nounImage = useNounImage("full", noun);
  return (
    <div className="flex justify-between">
      <div className="flex min-w-0 gap-[8px]">
        <div className="relative shrink-0">
          <Image
            src="/redeem-icon.png"
            width={22}
            height={22}
            alt="Redeem"
            className="absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3 rounded-full border-2 border-white"
          />
          <Image
            src={nounImage ?? "/noun-loading-skull.gif"}
            width={44}
            height={44}
            alt="Noun Image"
            className="mr-4 rounded-md object-contain"
            draggable={false}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="flex gap-1 whitespace-nowrap text-content-secondary paragraph-sm">
            Redeem by
            <Identity address={redeemer} avatarSize={16} />
          </span>
          <span className="label-md">Noun {noun.id}</span>
        </div>
      </div>
      <span className="shrink-0 pl-4 text-content-secondary paragraph-sm">
        {formatTimeSinceNow(Number(timestamp))}
      </span>
    </div>
  );
}

function DepositActivity({
  depositor,
  noun,
  timestamp,
}: {
  depositor: Address;
  noun: Noun;
  timestamp: Number;
}) {
  const nounImage = useNounImage("full", noun);
  return (
    <div className="flex justify-between">
      <div className="flex min-w-0 gap-[8px]">
        <div className="relative shrink-0">
          <Image
            src="/deposit-icon.png"
            width={22}
            height={22}
            alt="Deposit $nouns"
            className="absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3 rounded-full border-2 border-white"
          />
          <Image
            src={nounImage ?? "/noun-loading-skull.gif"}
            width={44}
            height={44}
            alt="Noun"
            className="mr-4 rounded-md object-contain"
            draggable={false}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="flex gap-1 whitespace-nowrap text-content-secondary paragraph-sm">
            Deposit by
            <Identity address={depositor} avatarSize={16} />
          </span>
          <span className="label-md">Noun {noun.id}</span>
        </div>
      </div>
      <span className="shrink-0 pl-4 text-content-secondary paragraph-sm">
        {formatTimeSinceNow(Number(timestamp))}
      </span>
    </div>
  );
}

function SwapActivity({
  swapper,
  inputNoun,
  outputNoun,
  timestamp,
}: {
  swapper: Address;
  inputNoun: Noun;
  outputNoun: Noun;
  timestamp: Number;
}) {
  const inputNounImage = useNounImage("full", inputNoun);
  const outputNounImage = useNounImage("full", outputNoun);
  return (
    <div className="flex justify-between">
      <div className="flex min-w-0 items-center gap-[24px]">
        <div className="relative shrink-0">
          <Image
            src="/swap-icon.png"
            width={22}
            height={22}
            alt="Swap Nouns"
            className="absolute left-0 top-0 z-10 -translate-x-1/3 -translate-y-1/3 rounded-full border-2 border-white"
          />
          <Image
            src={inputNounImage ?? "/noun-loading-skull.gif"}
            width={28}
            height={28}
            alt="Swap Input Noun"
            className="absolute left-[30px] top-1/2 z-0 h-[28px] w-[28px] -translate-y-1/2 rotate-[5deg] rounded-[4.6px] object-contain"
            draggable={false}
          />
          <Image
            src={outputNounImage ?? "/noun-loading-skull.gif"}
            width={40}
            height={40}
            alt="Swap Output Noun"
            className="z-10 h-[44px] w-[44px] -translate-x-[2px] rounded-md border-2 border-white object-contain"
            draggable={false}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="flex gap-1 whitespace-nowrap text-content-secondary paragraph-sm">
            Swap by
            <Identity address={swapper} avatarSize={16} />
          </span>
          <div className="flex items-center gap-1.5 label-md">
            <span>Noun {inputNoun.id}</span>
            <div className="rounded-full bg-background-secondary p-[3px]">
              <Icon icon="chevronRight" size={10} />
            </div>
            <span>Noun {outputNoun.id}</span>
          </div>
        </div>
      </div>
      <span className="shrink-0 pl-4 text-content-secondary paragraph-sm">
        {formatTimeSinceNow(Number(timestamp))}
      </span>
    </div>
  );
}

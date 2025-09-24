"use client";

import NounCard from "@nouns/components/NounCard";
import WalletButton from "@nouns/components/WalletButton";
import InstantSwapDialog from "@nouns/components/dialog/InstantSwapDialog";
import NounSelectDialog from "@nouns/components/dialog/NounSelectDialog";
import Icon from "@nouns/components/ui/Icon";
import { Button } from "@nouns/components/ui/button";
import { LinkExternal } from "@nouns/components/ui/link";
import { CHAIN_CONFIG } from "@nouns/config";
import { Noun } from "@nouns/data/noun/types";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";

interface InstantSwapProps {
  toNoun: Noun;
}

export function InstantSwap({ toNoun }: InstantSwapProps) {
  const [selectedUserNoun, setSelectedUserNoun] = useState<Noun | undefined>(
    undefined,
  );
  const { address } = useAccount();

  return (
    <>
      <div className="flex grow flex-col justify-between md:pb-[64px]">
        <div className="flex w-full grow flex-col border-b-4 md:flex-row">
          <div className="relative flex flex-1 grow flex-col items-center justify-center gap-8 border-b-2 border-border-secondary px-8 py-12 md:border-b-0 md:border-r-2">
            <WalletButton disableMobileShrink />
            <div className="flex flex-col items-center justify-center gap-6 lg:flex-row">
              <NounSelectDialog
                holderAddress={address}
                selectedUserNoun={selectedUserNoun}
                selectedNounCallback={(noun?: Noun) =>
                  setSelectedUserNoun(noun)
                }
              />
            </div>
            <Icon
              icon="swap"
              size={64}
              className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-background-secondary p-3 md:right-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-1/2"
            />
          </div>
          <div className="flex flex-1 grow flex-col items-center justify-center gap-8 border-t-2 border-border-secondary px-8 py-12 md:border-l-2 md:border-t-0">
            <LinkExternal
              className="hover:brightness-100"
              href={
                CHAIN_CONFIG.chain.blockExplorers?.default.url +
                "/address/" +
                CHAIN_CONFIG.addresses.nounsErc20
              }
            >
              <Button variant="secondary" className="gap-2 px-4 py-[6px]">
                <Image
                  src="/nouns-erc20.png"
                  width={32}
                  height={32}
                  alt="$nouns ERC-20"
                  className="bg-background-nouns rounded-full p-0.5"
                />
                <span className="label-md">$nouns ERC-20 Contract</span>
              </Button>
            </LinkExternal>
            <NounCard
              noun={toNoun}
              size={200}
              enableHover={false}
              alwaysShowNumber
            />
          </div>
        </div>
        <div className="item-center flex w-full flex-col-reverse items-center justify-end gap-6 px-4 py-4 text-content-secondary md:fixed md:bottom-0 md:flex-row md:border-t-4 md:bg-white md:px-10 md:py-2">
          <span className="text-center">
            This will instantly swap your Noun for Noun {toNoun.id}.
          </span>
          <InstantSwapDialog fromNoun={selectedUserNoun} toNoun={toNoun} />
        </div>
      </div>
    </>
  );
}

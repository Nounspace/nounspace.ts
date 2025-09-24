"use client";
import NounCard from "@nouns/components/NounCard";
import { useState } from "react";
import WalletButton from "@nouns/components/WalletButton";
import Image from "next/image";
import Icon from "@nouns/components/ui/Icon";
import { CHAIN_CONFIG } from "@nouns/config";
import { LinkExternal } from "@nouns/components/ui/link";
import { Button } from "@nouns/components/ui/button";
import NounSelectDialog from "@nouns/components/dialog/NounSelectDialog";
import UserTipDialog from "@nouns/components/dialog/UserTipDialog";
import { useRouter } from "next/navigation";
import { Noun } from "@nouns/data/noun/types";
import { useAccount } from "wagmi";

interface NounSwapProps {
  treasuryNoun: Noun;
}

export default function TreasurySwapStepOne({ treasuryNoun }: NounSwapProps) {
  const [selectedUserNoun, setSelectedUserNoun] = useState<Noun | undefined>(
    undefined,
  );
  const [tip, setTip] = useState<bigint | undefined>(undefined);
  const { address } = useAccount();

  const router = useRouter();

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
              <Icon icon="plus" size={20} className="fill-gray-600" />
              <UserTipDialog tip={tip} setTipCallback={setTip} />
            </div>
            <Icon
              icon="swap"
              size={64}
              className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-background-secondary p-3 md:right-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-1/2"
            />
          </div>
          <div className="flex flex-1 grow flex-col items-center justify-center gap-8 border-t-2 border-border-secondary px-8 py-12 md:border-l-2 md:border-t-0">
            <LinkExternal
              className="brightness-100"
              href={
                CHAIN_CONFIG.chain.blockExplorers?.default.url +
                "/address/" +
                CHAIN_CONFIG.addresses.nounsTreasury
              }
            >
              <Button variant="secondary" className="gap-2 px-4 py-[6px]">
                <Image
                  src="/nouns-icon.png"
                  width={32}
                  height={32}
                  alt="Nouns DAO"
                  className="bg-background-nouns rounded-full p-0.5"
                />
                <span className="label-md">Nouns Treasury</span>
              </Button>
            </LinkExternal>
            <NounCard
              noun={treasuryNoun}
              size={200}
              enableHover={false}
              alwaysShowNumber
            />
          </div>
        </div>
        <div className="item-center flex w-full flex-col-reverse items-center justify-end gap-6 border-border-secondary px-4 py-4 text-content-secondary md:fixed md:bottom-0 md:flex-row md:border-t-4 md:bg-white md:px-10 md:py-2">
          <Button
            className="w-full justify-center md:w-auto"
            disabled={selectedUserNoun == undefined || tip == undefined}
            onClick={() =>
              router.push(
                `/treasury-swap/${treasuryNoun.id}/${selectedUserNoun?.id}/${tip}`,
              )
            }
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

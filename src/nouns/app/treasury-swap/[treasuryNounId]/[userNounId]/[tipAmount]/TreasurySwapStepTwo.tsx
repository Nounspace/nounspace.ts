"use client";

import { useState } from "react";
import Icon from "@nouns/components/ui/Icon";
import NounCard from "@nouns/components/NounCard";
import { formatTokenAmount } from "@nouns/utils/utils";
import { NATIVE_ASSET_DECIMALS } from "@nouns/utils/constants";
import { Textarea } from "@nouns/components/ui/textarea";
import { Noun } from "@nouns/data/noun/types";
import TreasurySwapDialog from "@nouns/components/dialog/TreasurySwapDialog";

interface SwapReasonSelectProps {
  userNoun: Noun;
  treasuryNoun: Noun;
  tip: bigint;
}

export default function TreasurySwapStepTwo({ userNoun, treasuryNoun, tip }: SwapReasonSelectProps) {
  const [reason, setReason] = useState<string>("");

  return (
    <>
      <div className="flex grow flex-col items-center justify-between md:pb-[72px]">
        <div className="flex w-full max-w-[1200px] grow flex-col justify-center gap-6 p-4 md:flex-row">
          <div className="flex flex-[2] flex-col gap-4">
            <div className="paragraph-sm bg-semantic-accent-light flex w-full flex-row items-center gap-2 rounded-2xl p-4">
              <Icon icon="circleQuestion" size={16} className="shrink-0" />
              This will show up in the prop. Be honest and be detailed.
            </div>
            <h5 className="pt-2">Why do you want Noun {treasuryNoun.id}?</h5>
            <Textarea
              className="grow justify-start p-6 text-base"
              placeholder={`The reason I want to swap for Noun ${treasuryNoun.id} is because...`}
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </div>
          <div className="bg-background-secondary flex h-fit flex-1 flex-col items-center gap-1 rounded-3xl p-1 pt-4">
            <h6 className="pb-2">Review</h6>
            <div className="bg-background-primary text-content-secondary relative flex w-full flex-col items-center justify-center gap-4 rounded-[20px] px-4 pb-8 pt-4">
              You offer
              <div className="flex flex-row items-center justify-center gap-4">
                <NounCard noun={userNoun} size={100} enableHover={false} alwaysShowNumber />
                <Icon icon="plus" size={20} className="fill-gray-600" />
                <div className="bg-background-secondary flex h-[100px] items-center justify-center gap-3 rounded-xl px-4 py-2">
                  <h6 className="text-content-primary">{formatTokenAmount(tip, NATIVE_ASSET_DECIMALS, 6)} WETH</h6>
                </div>
              </div>
              <Icon
                icon="swap"
                size={52}
                className="border-border-secondary bg-background-primary absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 rounded-full border-4 p-3"
              />
            </div>
            <div className="bg-background-primary text-content-secondary flex w-full flex-col items-center justify-center gap-4 rounded-[20px] px-4 pb-4 pt-8">
              For
              <NounCard noun={treasuryNoun} size={100} enableHover={false} alwaysShowNumber />
            </div>
          </div>
        </div>
        <div className="item-center border-border-secondary text-content-secondary flex w-full flex-col-reverse items-center justify-end gap-6 border-t-4 px-4 py-4 md:fixed md:bottom-0 md:flex-row md:bg-white md:px-10 md:py-2">
          <span>Creates a prop in Nouns governance.</span>
          <TreasurySwapDialog userNoun={userNoun} treasuryNoun={treasuryNoun} tip={tip} reason={reason} />
        </div>
      </div>
    </>
  );
}

"use client";
import NounSelectDialog from "@nouns/components/dialog/NounSelectDialog";
import { Noun } from "@nouns/data/noun/types";
import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nouns/components/ui/tabs";
import { useAccount } from "wagmi";
import { CHAIN_CONFIG } from "@nouns/config";
import NounToErc20Dialog from "@nouns/components/dialog/NounToErc20Dialog";
import Erc20ToNounDialog from "@nouns/components/dialog/Erc20ToNounDialog";
import Icon from "@nouns/components/ui/Icon";
import { OneMillionErc20Card } from "@nouns/components/OneMillionErc20Card";
import { useSearchParams } from "next/navigation";

export default function Convert() {
  const [selectedUserNoun, setSelectedUserNoun] = useState<Noun | undefined>(
    undefined,
  );
  const [selectedErc20HeldNoun, setSelectedErc20HeldNoun] = useState<
    Noun | undefined
  >(undefined);
  const { address } = useAccount();

  const searchParams = useSearchParams();

  const tab = useMemo(() => {
    const req = searchParams?.get("tab");
    return req === "redeem" ? "redeem" : "deposit";
  }, [searchParams]);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set("tab", value);
        window.history.pushState(null, "", `?${params.toString()}`);
      }}
      defaultValue="deposit"
      className="flex flex-col overflow-hidden rounded-[20px] border-4 border-background-secondary"
    >
      <div className="flex flex-col items-center justify-between gap-4 bg-background-secondary px-6 py-4 md:flex-row">
        <h2>Convert</h2>
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
        </TabsList>
      </div>
      <div className="flex w-full flex-col border-b-4 border-background-secondary md:flex-row">
        <div className="relative flex-1 border-b-4 border-background-secondary px-4 pb-12 pt-4 md:border-b-0 md:border-r-4 md:pb-[88px] md:pt-10">
          <TabsContent
            value="deposit"
            className="flex flex-col items-center justify-center gap-6"
          >
            <h6>You send</h6>
            <NounSelectDialog
              holderAddress={address}
              selectedUserNoun={selectedUserNoun}
              selectedNounCallback={setSelectedUserNoun}
              size={160}
            />
          </TabsContent>
          <TabsContent
            value="redeem"
            className="flex flex-col items-center justify-center gap-6"
          >
            <h6>You send</h6>
            <OneMillionErc20Card />
          </TabsContent>
          <div className="absolute bottom-0 right-1/2 flex h-[72px] w-[72px] translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-[4px] border-white bg-background-secondary md:right-0 md:top-1/2 md:-translate-y-1/2">
            <Icon icon="swap" />
          </div>
        </div>
        <div className="flex-1 px-4 pb-4 pt-12 md:pb-[88px] md:pt-10">
          <TabsContent
            value="deposit"
            className="flex flex-col items-center justify-center gap-6"
          >
            <h6>You receive</h6>
            <OneMillionErc20Card />
          </TabsContent>
          <TabsContent
            value="redeem"
            className="flex flex-col items-center justify-center gap-6"
          >
            <h6>You receive</h6>
            <NounSelectDialog
              holderAddress={CHAIN_CONFIG.addresses.nounsErc20}
              selectedUserNoun={selectedErc20HeldNoun}
              selectedNounCallback={setSelectedErc20HeldNoun}
              size={160}
            />
          </TabsContent>
        </div>
      </div>
      <div className="flex flex-row items-center justify-end p-4 text-center">
        <TabsContent value="deposit" asChild>
          <NounToErc20Dialog depositNoun={selectedUserNoun} />
        </TabsContent>
        <TabsContent value="redeem" asChild>
          <Erc20ToNounDialog redeemNoun={selectedErc20HeldNoun} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

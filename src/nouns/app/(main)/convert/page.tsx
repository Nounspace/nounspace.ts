import Icon from "@nouns/components/ui/Icon";
import Convert from "./Convert";
import ConvertInfo from "./ConvertInfo";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Convert Nouns to $nouns | Unlock Fractional Ownership with Nouns DAO",
  description:
    "Convert your Nouns into $nouns tokens or redeem $nouns for a full Noun NFT. Unlock liquidity and stay connected to the Nouns DAO. Fast, simple, and secure.",
  alternates: {
    canonical: "./",
  },
};

export default function ConvertPage() {
  return (
    <div className="flex w-full max-w-[1680px] flex-col justify-between gap-[55px] p-6 md:flex-row md:p-10">
      <div className="flex w-full flex-[7] flex-col gap-4">
        <div className="flex gap-[10px] rounded-xl bg-yellow-100 p-4 paragraph-sm">
          <Icon
            icon="circleInfo"
            size={20}
            className="shrink-0 fill-content-primary"
          />
          <span>The $nouns contracts are unaudited use at your own risk. </span>
        </div>
        <Suspense fallback={null}>
          <Convert />
        </Suspense>
      </div>
      <div className="flex w-full flex-[3] pb-[80px] md:pb-0">
        <ConvertInfo />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Hero from "./_sections/Hero";
import Stats from "./_sections/Stats";
import BackedByNouns from "./_sections/BackedByNouns";
import Explainer from "./_sections/Explainer";
import GetStarted from "./_sections/GetStarted";
import VsNouns from "./_sections/VsNouns";
import Ticker from "./_sections/Ticker";
import StartJourney from "./_sections/StartJourney";
import Faq from "./_sections/Faq";
import Disclaimer from "./_sections/Disclaimer";
import Spend from "./_sections/Spend";

export const metadata: Metadata = {
  title: "$NOUNS | Nouns DAO's ERC-20 Token Backed by Nouns NFTs",
  description:
    "$NOUNS is an ERC-20 token for Nouns DAO backed by Nouns NFTs. 1,000,000 $NOUNS = 1 Noun NFT. Trade, collect, or redeem and join the community today!",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "$NOUNS | Nouns DAO",
    description:
      "An ERC-20 token you can trade, collect, or redeem for a Noun NFT anytime! 1 Noun = 1,000,000 $NOUNS.",
  },
};

export default function $NounsPage() {
  return (
    <div className="flex w-full flex-col items-center gap-[160px] pb-24 md:gap-[196px]">
      <Hero />
      <Stats />
      <Explainer />
      <BackedByNouns />
      <GetStarted />
      <Spend />
      <VsNouns />
      <Ticker />
      <StartJourney />
      <Faq />
      <Disclaimer />
    </div>
  );
}

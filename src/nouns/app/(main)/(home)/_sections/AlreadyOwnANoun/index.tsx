import Image from "next/image";
import AlreadyOwnANounCard from "./AlreadyOwnANounCard";
import { Suspense } from "react";
import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { isAddressEqual } from "viem";
import { CHAIN_CONFIG } from "@nouns/config";
import { Skeleton } from "@nouns/components/ui/skeleton";

export default function AlreadyOwnANoun() {
  return (
    <section className="flex w-full min-w-0 flex-col items-center justify-center gap-8 px-6 md:gap-16 md:px-10">
      <div className="flex max-w-[1600px] flex-col items-center justify-center gap-2 px-6 text-center md:px-10">
        <h2>Already own a Noun?</h2>
        <div className="max-w-[480px] paragraph-lg">
          Swap it for another or trade with the Nouns treasury to find your
          Forever Noun.
        </div>
      </div>

      <div className="flex w-full min-w-0 max-w-[1600px] flex-col gap-6 md:flex-row md:gap-10">
        <AlreadyOwnANounCard
          href="/explore?instantSwap=1"
          iconSrc="/feature/instant-swap/icon.svg"
          buttonLabel="Swap"
          description="Swap your Noun! for another Noun."
          cta={
            <div className="flex items-center whitespace-pre-wrap">
              <Suspense
                fallback={
                  <Skeleton className="inline h-[1em] w-[30px] bg-blue-100" />
                }
              >
                <InstantSwapNounsAvailable />
              </Suspense>
              <span> Nouns Available</span>
            </div>
          }
          className="bg-background-secondary"
        >
          <Image
            src="/feature/instant-swap/main.png"
            width={270}
            height={280}
            alt="Swap Nouns"
            className="hidden self-end object-cover lg:block"
          />
        </AlreadyOwnANounCard>
        <AlreadyOwnANounCard
          href="/explore?onlyTreasuryNouns=1"
          iconSrc="/feature/treasury-swap/icon.svg"
          buttonLabel="Trade"
          description="Offer to trade your Noun with one in the Treasury."
          cta={
            <div className="flex items-center whitespace-pre-wrap">
              <Suspense
                fallback={
                  <Skeleton className="inline h-[1em] w-[30px] bg-blue-100" />
                }
              >
                <TreasuryNounsAvailable />
              </Suspense>
              <span> Nouns Available</span>
            </div>
          }
          className="bg-background-secondary"
        >
          <Image
            src="/feature/treasury-swap/main.png"
            width={160}
            height={280}
            alt="Swap Noun with Treasury"
            className="hidden self-end object-cover object-left lg:block"
          />
        </AlreadyOwnANounCard>
      </div>
    </section>
  );
}

async function InstantSwapNounsAvailable() {
  const nouns = await getAllNouns();
  const nounsAvailable = nouns.filter((noun) =>
    isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsErc20),
  );
  return <span className="inline-block">{nounsAvailable.length}</span>;
}

async function TreasuryNounsAvailable() {
  const nouns = await getAllNouns();
  const nounsAvailable = nouns.filter((noun) =>
    isAddressEqual(noun.owner, CHAIN_CONFIG.addresses.nounsTreasury),
  );
  return <span className="inline-block">{nounsAvailable.length}</span>;
}

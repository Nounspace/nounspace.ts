import FeatureHighlightCard from "@nouns/components/FeatureHighlightCard";
import Image from "next/image";

export default function GetStarted() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14 px-6 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
        <h2>Get started with $NOUNS</h2>
        <p className="max-w-[480px] text-center paragraph-lg">
          Choose how you want to get started.
        </p>
      </div>
      <div className="grid w-full min-w-0 max-w-[1280px] grid-cols-1 flex-col gap-6 md:grid-cols-2 md:gap-10">
        <FeatureHighlightCard
          href="https://matcha.xyz/tokens/base/0x0a93a7be7e7e426fc046e204c44d6b03a302b631"
          iconSrc="/feature/$nouns-buy/icon.svg"
          buttonLabel="Buy"
          description="Purchase $NOUNS on a DEX to start collecting."
          className="gap-4 bg-yellow-400 pb-8 md:pb-10"
        >
          <Image
            src="/feature/$nouns-buy/main.png"
            width={309}
            height={152}
            alt="Buy Secondary Nouns"
            className="h-[152px] w-[309px] object-cover"
          />
          <p className="label-sm">Swap on Matcha ↗</p>
        </FeatureHighlightCard>
        <FeatureHighlightCard
          href="/convert?tab=deposit"
          iconSrc="/feature/$nouns-convert/icon.svg"
          buttonLabel="Convert"
          description="Own a Noun? Convert it into $NOUNS to unlock liquidity."
          className="bg-green-500 text-white"
        >
          <Image
            src="/feature/$nouns-convert/main.png"
            width={450}
            height={332}
            alt="Buy Secondary Nouns"
            className="h-[332px] w-[450px] object-cover"
          />
        </FeatureHighlightCard>
        <FeatureHighlightCard
          href="/convert?tab=redeem"
          iconSrc="/feature/$nouns-redeem/icon.svg"
          buttonLabel="Redeem"
          description="Collect $NOUNS tokens and redeem them for a Noun."
          className="gap-4 bg-blue-400 pb-8 text-white md:pb-10"
        >
          <Image
            src="/feature/$nouns-redeem/main.png"
            width={169}
            height={212}
            alt="Buy Secondary Nouns"
            className="h-[212px] w-[169px] object-cover"
          />
          <p className="label-sm">1,000,000 $NOUNS = 1 Noun</p>
        </FeatureHighlightCard>
        <FeatureHighlightCard
          href="https://app.uniswap.org/positions/create/v3?currencyA=0x0a93a7BE7e7e426fC046e204C44d6b03A302b631&currencyB=NATIVE&chain=base"
          iconSrc="/feature/$nouns-earn/icon.svg"
          buttonLabel="Earn"
          description="Add liquidity on Uniswap to support $NOUNS and earn LP rewards."
          className="gap-4 bg-background-secondary pb-8 md:pb-10"
        >
          <Image
            src="/feature/$nouns-earn/main.png"
            width={400}
            height={290}
            alt="Buy Secondary Nouns"
            className="h-[290px] w-[400px] object-cover"
          />
          <p className="label-sm">LP on Uniswap ↗</p>
        </FeatureHighlightCard>
      </div>
    </section>
  );
}

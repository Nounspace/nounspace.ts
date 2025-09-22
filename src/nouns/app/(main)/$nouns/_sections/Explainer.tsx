import AnimateIn from "@nouns/components/AnimateIn";
import Image from "next/image";

export default function Explainer() {
  return (
    <section className="w-full max-w-[1360px] px-6 md:px-10">
      <AnimateIn
        delayS={0.8}
        className="flex w-full min-w-0 flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl bg-background-dark text-white md:gap-14"
      >
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-2 px-8 pt-12 text-center">
          <h2>1 Noun = 1,000,000 $NOUNS</h2>
          <p className="max-w-[632px] text-center text-gray-400 paragraph-lg">
            Deposit a Noun into the $NOUNS contract to mint 1,000,000 $NOUNS
            tokens. Trade, collect, or redeem them for a full Noun NFT anytime!
          </p>
        </div>
        <Image
          src="/nouns-erc20-explainer/desktop.png"
          width={940}
          height={212}
          alt="Nouns ERC-20 Explainer (desktop)"
          className="hidden h-[212px] w-[940px] object-cover md:block"
        />
        <Image
          src="/nouns-erc20-explainer/mobile.png"
          width={445}
          height={212}
          alt="Nouns ERC-20 Explainer (mobile)"
          className="block h-[212px] w-[445px] object-cover md:hidden"
        />
      </AnimateIn>
    </section>
  );
}

import { Button } from "@nouns/components/ui/button";
import Icon from "@nouns/components/ui/Icon";
import { LinkExternal } from "@nouns/components/ui/link";
import Link from "next/link";
import Background from "./Background";
import AnimateIn from "@nouns/components/AnimateIn";

export default function Hero() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center gap-8 pt-[85px] md:pt-[136px]">
      <Background />

      <div className="z-[1] flex max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
        <AnimateIn delayS={0}>
          <span className="heading-5">Say hello to</span>
        </AnimateIn>
        <AnimateIn delayS={0.2}>
          <h1 className="text-[96px] leading-[96px] md:text-[120px] md:leading-[120px]">
            $NOUNS
          </h1>
        </AnimateIn>
        <AnimateIn delayS={0.4}>
          <p className="text-center paragraph-lg">
            A fun, flexible way to engage with the Nouns ecosystem. $NOUNS is an
            ERC-20 token you can stack to earn a Noun!
          </p>
        </AnimateIn>
      </div>
      <AnimateIn
        delayS={0.6}
        className="z-[1] flex flex-col items-center justify-center gap-4 md:flex-row"
      >
        <LinkExternal href="https://matcha.xyz/tokens/base/0x0a93a7be7e7e426fc046e204c44d6b03a302b631">
          <Button className="flex h-[56px] gap-2.5 rounded-full label-lg">
            <span>Buy $NOUNS</span>
            <Icon icon="arrowUpRight" size={24} className="fill-white" />
          </Button>
        </LinkExternal>
        <Link href="/convert">
          <Button
            variant="secondary"
            className="h-[56px] rounded-full label-lg"
          >
            Convert Nouns
          </Button>
        </Link>
      </AnimateIn>
    </section>
  );
}

import JoinFarcasterCommunity from "@nouns/components/JoinFarcasterCommunity";
import { Button } from "@nouns/components/ui/button";
import Icon from "@nouns/components/ui/Icon";
import { LinkExternal } from "@nouns/components/ui/link";
import Image from "next/image";

export default function StartJourney() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14 px-6 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
        <h2>Start your $NOUNS journey</h2>
        <p className="max-w-[646px] text-center paragraph-lg">
          Whether you're an artist, technologist, scientist, or athlete, there's
          a place for you in the Nouns community.
        </p>
      </div>
      <div className="flex w-full max-w-[1280px] flex-col gap-6 md:flex-row md:gap-10">
        <JoinFarcasterCommunity />

        <LinkExternal
          href="https://github.com/verbsteam/nouns-erc20"
          className="flex w-full flex-1 flex-col items-center justify-start gap-8 overflow-hidden rounded-[24px] bg-background-dark p-6 md:p-12"
        >
          <Image
            src="/socials/github.svg"
            width={48}
            height={48}
            alt="$NOUNS Github"
          />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-center text-white">Dig into the Code</h2>
            <div className="max-w-[640px] text-center text-gray-200 paragraph-lg">
              Learn how the $NOUNS contract works under the hood.
            </div>
          </div>
          <Button
            variant="secondary"
            className="flex gap-2.5 rounded-full border-none label-lg"
          >
            <span>View Github</span>
            <Icon
              icon="arrowUpRight"
              size={24}
              className="fill-content-primary"
            />
          </Button>
        </LinkExternal>
      </div>
    </section>
  );
}

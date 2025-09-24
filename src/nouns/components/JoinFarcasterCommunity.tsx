import Image from "next/image";
import { LinkExternal } from "./ui/link";
import { Button } from "./ui/button";
import Icon from "./ui/Icon";

export default function JoinFarcasterCommunity() {
  return (
    <LinkExternal
      href="https://warpcast.com/~/channel/nouns"
      className="flex w-full flex-1 flex-col items-center justify-start gap-6 overflow-hidden rounded-3xl bg-[#8661CD] p-6 text-center text-white md:p-12"
    >
      <Image
        src="/socials/farcaster.svg"
        width={48}
        height={48}
        alt="Farcaster"
      />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-center text-white">Join the Nouns Community</h2>
        <div className="max-w-[640px] text-center text-gray-200 paragraph-lg">
          Join the conversation on Farcaster, a social network similar to X and
          Reddit. Share your ideas, connect with the Nouns community.
        </div>
      </div>
      <Button
        variant="secondary"
        className="flex gap-2.5 rounded-full border-none label-lg"
      >
        <span>Join Nouns on Farcaster</span>
        <Icon icon="arrowUpRight" size={24} className="fill-content-primary" />
      </Button>
      <div className="flex items-center justify-center gap-1.5">
        <Image
          src="/farcaster-followers.png"
          width={58}
          height={24}
          alt="Nouns DAO Farcaster"
        />
        <span>100k+ Followers</span>
      </div>
    </LinkExternal>
  );
}

import { LinkExternal } from "@nouns/components/ui/link";
import { Separator } from "@nouns/components/ui/separator";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function ConvertInfo() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <InfoSection title="What is $nouns?">
        $NOUNS is an ERC-20 token that represents fractional ownership of a Noun
        NFT. You can swap a Noun NFT for 1,000,000 $NOUNS or redeem 1,000,000
        $NOUNS to claim a Noun NFT.
        <br />
        <br />
        Simply put, <b>1 Noun = 1,000,000 $nouns.</b>
      </InfoSection>
      <Link href="/$nouns">
        <div className="flex h-[80px] w-full overflow-hidden rounded-[16px] border transition-all clickable-active hover:bg-background-ternary">
          <Image
            src="/$nouns-page.png"
            width={95}
            height={80}
            alt="$nouns ERC-20"
          />
          <div className="flex h-full flex-col justify-center gap-1 px-4 py-2">
            <h2 className="label-md">$NOUNS (ERC-20)</h2>
            <p className="text-content-secondary label-sm">Learn more</p>
          </div>
        </div>
      </Link>
      <Separator className="h-[2px]" />
      <InfoSection title="What happens when I convert my Noun?">
        You will receive 1,000,000 $nouns on Ethereum Mainnet. You won't own
        your Noun anymore; it will be placed in the $nouns ERC-20 contract.
        Anyone can exchange 1,000,000 $nouns for any Noun held in the $nouns
        contract.
      </InfoSection>
      <Separator className="h-[2px]" />
      <InfoSection title="Is Nouns.com affiliated with $nouns?">
        No, Nouns.com is not affiliated with $nouns. This interface is only a
        layer to interact with the $nouns contracts. No funds are held in
        custody by Nouns.com at any point.
      </InfoSection>
      <Separator className="h-[2px]" />
      <div className="flex flex-col gap-4">
        <h6>Useful links</h6>
        <div className="flex flex-col">
          <LinkItem href="https://docs.google.com/document/d/1Uz4l8bAPaA2_gsUVZsZo_1dAmggAiYIn5sYba1IK10Q/edit#heading=h.krcxuhjg5aem">
            $nouns Token Spec
          </LinkItem>
          <LinkItem href="https://app.uniswap.org/swap?chain=base&outputCurrency=0x0a93a7BE7e7e426fC046e204C44d6b03A302b631">
            Purchase $nouns on Base
          </LinkItem>
          <LinkItem href="https://superbridge.app/base">
            Bridge to Base
          </LinkItem>
          <LinkItem href="https://etherscan.io/address/0x5c1760c98be951A4067DF234695c8014D8e7619C">
            $nouns Mainnet Contract
          </LinkItem>
          <LinkItem href="https://basescan.org/address/0x0a93a7BE7e7e426fC046e204C44d6b03A302b631">
            $nouns Base Contract
          </LinkItem>
        </div>
      </div>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b- flex flex-col gap-4">
      <h6>{title}</h6>
      <div className="text-content-secondary paragraph-sm">{children}</div>
    </div>
  );
}

function LinkItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <LinkExternal
      href={href}
      className="flex w-full justify-between py-3 text-content-primary label-sm hover:text-content-secondary"
    >
      {children}
      <ExternalLink size={16} />
    </LinkExternal>
  );
}

import Link from "next/link";
import WalletButton from "../WalletButton";
import { CurrentAuctionSmall } from "../CurrentAuction";
import HidingHeader from "./HidingHeader";
import DesktopNav from "../Nav/DesktopNav";
import { NounsDotComLogoLink } from "../NounsDotComLogoLink";
import { CurrentAuctionPrefetchWrapper } from "../CurrentAuction/CurrentAuctionPrefetchWrapper";

const HEADER_HEIGHT = 64;

export function Header() {
  return (
    <HidingHeader>
      <div
        className="flex w-full flex-row justify-between overflow-hidden bg-white px-4 py-2 shadow-bottom-only md:px-8"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="flex items-center gap-6 md:flex-1">
          <NounsDotComLogoLink />
          <DesktopNav />
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 text-gray-600">
          <Link
            href="/"
            className="rounded-lg border-transparent p-2 transition-all hover:bg-background-secondary/50"
          >
            <CurrentAuctionPrefetchWrapper>
              <CurrentAuctionSmall />
            </CurrentAuctionPrefetchWrapper>
          </Link>
          <WalletButton />
        </div>
      </div>
    </HidingHeader>
  );
}

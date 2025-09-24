import clsx from "clsx";
import Icon from "../ui/Icon";
import { LinkShallow } from "../ui/link";

export default function NavButtons({ auctionId, currentAuctionId }: { auctionId: string; currentAuctionId: string }) {
  const leftDisabled = auctionId == "0";
  const rightDisabled = auctionId == currentAuctionId;
  return (
    <div className="flex flex-row-reverse gap-3 md:flex-row">
      <div className="flex gap-3">
        <LinkShallow
          searchParam={{ name: "auctionId", value: (Number(auctionId) - 1).toString() }}
          variant="rounded-icon"
          size="icon-slim"
          className={clsx("h-9 w-9", leftDisabled && "bg-gray-400")}
          disabled={leftDisabled}
        >
          <Icon icon="arrowLeft" className={clsx(leftDisabled && "fill-white")} />
        </LinkShallow>

        <LinkShallow
          searchParam={{ name: "auctionId", value: (Number(auctionId) + 1).toString() }}
          variant="rounded-icon"
          size="icon-slim"
          className={clsx("h-9 w-9", rightDisabled && "bg-gray-400")}
          disabled={rightDisabled}
        >
          <Icon icon="arrowRight" className={clsx(rightDisabled && "fill-white")} />
        </LinkShallow>
      </div>

      {currentAuctionId != auctionId && (
        <LinkShallow
          searchParam={{ name: "auctionId", value: null }}
          className="label-sm clickable-active hover:bg-background-secondary border-border-secondary flex h-9 items-center rounded-full border-2 bg-white px-3 py-[10px]"
        >
          Latest
        </LinkShallow>
      )}
    </div>
  );
}

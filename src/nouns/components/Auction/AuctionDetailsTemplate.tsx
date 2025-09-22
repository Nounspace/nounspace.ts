import clsx from "clsx";
import { ReactNode } from "react";

const ONE_OFF_MD_FONT = "md:text-[28px] md:font-bold md:leading-[36px]";

export function AuctionDetailTemplate({
  item1,
  item2,
}: {
  item1: { title: string; value: ReactNode; onClick?: () => void };
  item2: { title: string; value: ReactNode; onClick?: () => void };
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden md:w-fit md:flex-row md:gap-12">
      <div
        className={clsx("label-md flex shrink-0 justify-between md:flex-col", item1.onClick && "hover:cursor-pointer")}
        onClick={item1.onClick}
      >
        <span className="text-content-secondary shrink-0 pr-2">{item1.title}</span>
        <span className={clsx("text-content-primary/80", ONE_OFF_MD_FONT)}>{item1.value}</span>
      </div>
      <div
        className={clsx("label-md flex min-w-0 justify-between md:flex-col", item2.onClick && "hover:cursor-pointer")}
        onClick={item2.onClick}
      >
        <span className="text-content-secondary shrink-0 pr-2">{item2.title}</span>
        <div
          className={clsx("text-content-primary/80 min-w-0 items-center justify-end md:justify-start", ONE_OFF_MD_FONT)}
        >
          {item2.value}
        </div>
      </div>
    </div>
  );
}

import Icon from "@nouns/components/ui/Icon";
import { TooltipPopover } from "@nouns/components/ui/tooltipPopover";
import { cn } from "@nouns/utils/shadcn";
import clsx from "clsx";
import { HTMLAttributes } from "react";

interface TableItem {
  feature: { name: string; details: string };
  nouns: boolean;
  $nouns: boolean;
}

const TABLE_ITEMS: TableItem[] = [
  {
    feature: {
      name: "Voting Power",
      details:
        "Nouns NFTs grant direct voting power over the Nouns Treasury, a governance privilege that $NOUNS holders do not possess.",
    },
    nouns: true,
    $nouns: false,
  },
  {
    feature: {
      name: "Exposure to Nouns",
      details:
        "$NOUNS provides exposure to Nouns by being directly collateralized by them, with a fixed conversion rate of 1,000,000 $NOUNS per Noun NFT.",
    },
    nouns: true,
    $nouns: true,
  },
  {
    feature: {
      name: "Low-Cost Entry",
      details:
        "$NOUNS enables fractional ownership of Nouns NFTs, allowing anyone to gain exposure for fractions of a cent—down to increments as small as 1e-24 of a Noun.",
    },
    nouns: false,
    $nouns: true,
  },
  {
    feature: {
      name: "Liquid",
      details:
        "$NOUNS tokens are traded on decentralized exchanges, enabling easy buying and selling.",
    },
    nouns: false,
    $nouns: true,
  },
  {
    feature: {
      name: "Access to DeFi",
      details:
        "$NOUNS tokens implement the ERC-20 token standard, so they integrate seamlessly with DeFi protocols, unlocking opportunities for staking, lending, and other financial applications.",
    },
    nouns: false,
    $nouns: true,
  },
];

export default function VsNouns() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-14 px-6 md:px-10">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center">
        <h2>Nouns vs $NOUNS</h2>
        <p className="max-w-[480px] text-center paragraph-lg">
          See how $NOUNS compare to owning a Noun.
        </p>
      </div>
      <div className="flex w-full max-w-[640px] flex-col items-center justify-center gap-4 label-md">
        <div className="flex w-full justify-between px-4 md:px-6">
          <span>Feature</span>
          <div className="flex">
            <div className="flex w-[80px] items-center justify-end md:w-[100px]">
              Nouns
            </div>
            <div className="flex w-[80px] items-center justify-end md:w-[100px]">
              $NOUNS
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col">
          {TABLE_ITEMS.map((item, i) => (
            <TableRow
              item={item}
              key={item.feature.name}
              className={clsx(i % 2 == 0 && "bg-background-secondary")}
            />
          ))}
        </div>

        <p className="w-full text-center text-content-secondary paragraph-sm">
          $NOUNS let you start small, trade easily, and be part of the Nouns
          ecosystem.
        </p>
      </div>
    </section>
  );
}

function TableRow({
  item,
  className,
  ...props
}: { item: TableItem } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-[16px] p-4 md:p-6",
        className,
      )}
      {...props}
    >
      <TooltipPopover
        trigger={
          <div className="flex flex-wrap items-center gap-1">
            {item.feature.name}
            <Icon
              icon="circleInfo"
              className="fill-content-secondary"
              size={20}
            />
          </div>
        }
      >
        {item.feature.details}
      </TooltipPopover>
      <div className="flex">
        <div className="flex w-[50px] items-center justify-end md:w-[100px]">
          <Icon
            icon={item.nouns ? "circleCheck" : "circleX"}
            size={26}
            className={clsx(
              item.nouns ? "fill-green-600" : "fill-semantic-negative",
            )}
          />
        </div>
        <div className="flex w-[80px] items-center justify-end md:w-[100px]">
          <Icon
            icon={item.$nouns ? "circleCheck" : "circleX"}
            size={26}
            className={clsx(
              item.$nouns ? "fill-green-600" : "fill-semantic-negative",
            )}
          />
        </div>
      </div>
    </div>
  );
}

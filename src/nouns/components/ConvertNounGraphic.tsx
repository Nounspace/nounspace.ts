import { Noun } from "@nouns/data/noun/types";
import NounCard from "./NounCard";
import Icon from "./ui/Icon";
import Image from "next/image";

interface ConvertNounGraphicProps {
  noun: Noun;
  action: "deposit" | "redeem";
  asset?: "$nouns" | "eth";
  amount?: string;
  scale?: number;
}

export default function ConvertNounGraphic({
  noun,
  action,
  asset,
  amount,
  scale,
}: ConvertNounGraphicProps) {
  return (
    <div className="flex flex-row gap-5" style={{ scale: scale }}>
      <div className="relative">
        {action === "deposit" ? (
          <NounCard noun={noun} size={80} enableHover={false} />
        ) : (
          <Erc20Card asset={asset} amount={amount} />
        )}
        <div className="absolute right-0 top-1/2 z-40 -translate-y-1/2 translate-x-[calc(50%+10px)]">
          <Icon
            icon={"swap"}
            size={36}
            className="rounded-full border-2 border-white bg-background-secondary p-2"
          />
        </div>
      </div>
      {action === "redeem" ? (
        <NounCard noun={noun} size={80} enableHover={false} />
      ) : (
        <Erc20Card asset={asset} amount={amount} />
      )}
    </div>
  );
}

function Erc20Card({
  asset,
  amount,
}: {
  asset?: "$nouns" | "eth";
  amount?: string;
}) {
  const assetInternal = asset ?? "$nouns";
  return (
    <div className="flex h-[80px] w-[80px] flex-col items-center justify-center gap-2 rounded-[12px] bg-background-secondary">
      <Image
        src={
          assetInternal == "$nouns"
            ? "/erc-20-nouns-ethereum.png"
            : "/ethereum-logo.png"
        }
        width={100}
        height={100}
        alt="$nouns ERC-20 Fractionalized Noun"
        className="h-[43px] w-[43px]"
      />
      {amount != undefined && (
        <span className="flex w-full items-center justify-center label-sm">
          {amount}
        </span>
      )}
    </div>
  );
}

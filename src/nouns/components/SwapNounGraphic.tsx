import { Noun } from "@nouns/data/noun/types";
import NounCard from "./NounCard";
import Icon from "./ui/Icon";

interface SwapNounGraphicProps {
  fromNoun: Noun;
  toNoun: Noun;
  instant?: boolean;
}

export default function SwapNounGraphic({ fromNoun, toNoun, instant }: SwapNounGraphicProps) {
  return (
    <div className="flex flex-row gap-5">
      <div className="relative">
        <NounCard noun={fromNoun} size={80} enableHover={false} />
        <div className="absolute right-0 top-1/2 z-40 -translate-y-1/2 translate-x-[calc(50%+10px)]">
          <Icon
            icon={instant ? "lightning" : "swap"}
            size={36}
            className="bg-background-secondary rounded-full border-2 border-white p-2"
          />
        </div>
      </div>
      <NounCard noun={toNoun} size={80} enableHover={false} />
    </div>
  );
}

import { Noun } from "@nouns/data/noun/types";
import NounCard from "./NounCard";
import Icon from "./ui/Icon";

interface SuccessfulNounSwapGraphicProps {
  fromNoun: Noun;
  toNoun: Noun;
}

export function SuccessfulNounSwapGraphic({ fromNoun, toNoun }: SuccessfulNounSwapGraphicProps) {
  return (
    <div className="relative scale-[70%] md:scale-100">
      <div className="relative z-[1] rounded-3xl bg-white p-2">
        <NounCard noun={toNoun} enableHover={false} alwaysShowNumber size={200} />
      </div>
      <Icon
        icon="circleCheck"
        size={64}
        className="absolute -right-4 -top-4 z-[2] rounded-full border-[6px] border-white bg-white fill-green-600"
      />
      <div className="absolute -left-[100px] bottom-[8px] h-fit w-fit -rotate-[15deg] opacity-50">
        <NounCard noun={fromNoun} enableHover={false} size={160} />
      </div>
    </div>
  );
}

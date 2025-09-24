import { useMemo } from "react";
import { Noun } from "@nouns/data/noun/types";
import { buildNounImage, NounImageType } from "@nouns/utils/nounImages/nounImage";

export function useNounImage(
  imageType: NounImageType,
  noun?: Noun,
): string | undefined {
  return useMemo(() => {
    return noun ? buildNounImage(noun.traits, imageType) : undefined;
  }, [noun, imageType]);
}

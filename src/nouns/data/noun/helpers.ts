import { getNounData } from "@nouns/utils/nounImages/nounImage";
import { AllNounsQuery } from "../generated/gql/graphql";
import { Noun } from "./types";
import { getAddress } from "viem";

function extractNameFromFileName(filename: string) {
  return filename.substring(filename.indexOf("-") + 1);
}

// Async just so we can cache
export function transformQueryNounToNoun(
  queryNoun: AllNounsQuery["nouns"][0],
): Omit<Noun, "secondaryListing"> {
  if (!queryNoun.seed) {
    throw new Error("Seed not found");
  }

  const seed = {
    background: Number(queryNoun.seed.background),
    body: Number(queryNoun.seed.body),
    accessory: Number(queryNoun.seed.accessory),
    head: Number(queryNoun.seed.head),
    glasses: Number(queryNoun.seed.glasses),
  };

  const { parts, background } = getNounData(seed);
  const [bodyPart, accessoryPart, headPart, glassesPart] = parts;

  return {
    id: queryNoun.id,
    owner: getAddress(queryNoun.owner.id),
    traits: {
      background: {
        seed: seed.background,
        name: queryNoun.seed.background == "0" ? "Cool" : "Warm",
      },
      body: {
        seed: seed.body,
        name: bodyPart.filename,
      },
      accessory: {
        seed: seed.accessory,
        name: extractNameFromFileName(accessoryPart.filename),
      },
      head: {
        seed: seed.head,
        name: extractNameFromFileName(headPart.filename),
      },
      glasses: {
        seed: seed.glasses,
        name: extractNameFromFileName(glassesPart.filename),
      },
    },
  };
}

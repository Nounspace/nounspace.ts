import { Noun, NounTraitType } from "@nouns/data/noun/types";
import { buildSVG } from "../../mocks/nouns-sdk";
import { imageData } from "./imageData";

const { palette, bgcolors } = imageData;
const { bodies, accessories, heads, glasses } = imageData.images;

export type NounImageType = "full" | NounTraitType;

export function buildBase64Image(
  parts: {
    data: string;
  }[],
  bgColor?: string,
  cropViewBox?: string,
) {
  let svg = buildSVG(parts, palette, bgColor);

  if (cropViewBox) {
    svg = svg.replace(`viewBox="0 0 320 320"`, `viewBox="${cropViewBox}"`);
  }

  const svgBase64 = btoa(svg);

  return "data:image/svg+xml;base64," + svgBase64;
}

export function getNounData(seed: {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}) {
  return {
    parts: [
      bodies[seed.body],
      accessories[seed.accessory],
      heads[seed.head],
      glasses[seed.glasses],
    ],
    background: bgcolors[seed.background],
  };
}

export function buildNounImage(
  traits: Noun["traits"],
  imageType: NounImageType,
): string {
  const seed = {
    background: traits.background.seed,
    body: traits.body.seed,
    accessory: traits.accessory.seed,
    head: traits.head.seed,
    glasses: traits.glasses.seed,
  };

  const { parts, background } = getNounData(seed);
  const [bodyPart, accessoryPart, headPart, glassesPart] = parts;

  switch (imageType) {
    case "full":
      return buildBase64Image(parts, background);
    case "body":
      return buildBase64Image([bodyPart], background);
    case "accessory":
      return buildBase64Image([accessoryPart], background);
    case "head":
      return buildBase64Image([headPart], background);
    case "glasses":
      return buildBase64Image([glassesPart], background);
    case "background":
      return buildBase64Image([{ data: "0x0" }], background);
    default:
      return "";
  }
}

const TRAIT_TYPE_VIEW_BOX: Record<NounTraitType, string> = {
  head: "10 -20 300 300",
  glasses: "70 60 160 160",
  body: "90 195 140 140",
  accessory: "90 195 140 140",
  background: "0 0 320 320",
};

export function buildNounTraitImage(
  traitType: NounTraitType,
  seed: number,
): string {
  const data = getPartData(traitType, seed);
  let viewBox = TRAIT_TYPE_VIEW_BOX[traitType];

  return buildBase64Image(
    [{ data }],
    traitType == "background" ? bgcolors[seed] : undefined,
    viewBox,
  );
}

function getPartData(traitType: NounTraitType, seed: number) {
  switch (traitType) {
    case "head":
      return heads[seed].data;
    case "glasses":
      return glasses[seed].data;
    case "body":
      return bodies[seed].data;
    case "accessory":
      return accessories[seed].data;
    case "background":
      return ""; // TODO
  }
}

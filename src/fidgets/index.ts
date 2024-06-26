// TO DO: Figure out how to do this importing dynamically
import { LayoutFidget } from "@/common/fidgets";
import Example from "./example";
import Frame from "./frame";
import Gallery from "./ui/gallery";
import TextFidget from "./ui/Text";
import Grid from "./layout/Grid";
import NounishGovernance from "./community/nouns-dao/NounishGovernance";

export const CompleteFidgets = {
  example: Example,
  frame: Frame,
  gallery: Gallery,
  text: TextFidget,
  "nounish-governance": NounishGovernance,
};

export const LayoutFidgets = {
  grid: Grid,
} as {
  [key: string]: LayoutFidget;
};

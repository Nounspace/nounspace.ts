// TO DO: Figure out how to do this importing dynamically
import { LayoutFidget } from "@/common/fidgets";
import Example from "./example";
import Frame from "./frame";
import Gallery from "./ui/gallery";
import TextFidget from "./ui/Text";
import IFrame from "./ui/IFrame";
import Profile from "./ui/profile";
import Grid from "./layout/Grid";
import NounishGovernance from "./community/nouns-dao/NounishGovernance";

export const CompleteFidgets = {
  example:
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ? Example : undefined,
  frame: Frame,
  gallery: Gallery,
  text: TextFidget,
  governance: NounishGovernance,
  iframe: IFrame,
  profile: Profile,
};

export const LayoutFidgets = {
  grid: Grid,
} as {
  [key: string]: LayoutFidget<any>;
};

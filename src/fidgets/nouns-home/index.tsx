import React from "react";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import BaseNounsHomeFidget from "./NounsHomeFidget";

export type NounsHomeFidgetSettings = FidgetSettingsStyle;

const nounsHomeProperties: FidgetProperties = {
  fidgetName: "Nouns Home",
  icon: 0x1f5bc,
  fields: [
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 8,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const NounsHomeFidget: React.FC<FidgetArgs<NounsHomeFidgetSettings>> = () => {
  return <BaseNounsHomeFidget />;
};

export const fidget = {
  id: "nouns-home",
  title: "Nouns",
  description: "Nouns homepage (auction) UI inside nounspace",
  version: "1.0.0",
};

const NounsHomeModule = {
  fidget: NounsHomeFidget,
  properties: nounsHomeProperties,
} as FidgetModule<FidgetArgs<NounsHomeFidgetSettings>>;

export { BaseNounsHomeFidget as NounsHomeFidget };
export default NounsHomeModule;

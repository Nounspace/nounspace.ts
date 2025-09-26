import React from "react";
import FontSelector from "@/common/components/molecules/FontSelector";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import BaseNounsHomeFidget from "./NounsHomeFidget";

export type NounsHomeFidgetSettings = {
  fontFamily?: string;
  fontColor?: string;
  headingsFontFamily?: string;
  headingsFontColor?: string;
} & FidgetSettingsStyle;

const nounsHomeProperties: FidgetProperties = {
  fidgetName: "Nouns Home",
  icon: 0x1f5bc,
  fields: [
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint:
        "Body font for the fidget. Set to Theme Font to inherit your Space settings.",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: (props) => <FontSelector {...props} />,
      group: "style",
    },
    {
      fieldName: "fontColor",
      displayName: "Font Color",
      displayNameHint: "Body text color",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-font-color)"
          defaultColor="#000000"
          colorType="font color"
        />
      ),
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      displayName: "Headings Font Family",
      displayNameHint:
        "Font for titles like ‘Noun ####’. Choose Londrina Solid for nouns.com style, or inherit Theme Headings Font.",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: (props) => <FontSelector {...props} />,
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      displayName: "Headings Font Color",
      displayNameHint: "Color used for titles",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-headings-font-color)"
          defaultColor="#000000"
          colorType="headings color"
        />
      ),
      group: "style",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 6,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const NounsHomeFidget: React.FC<FidgetArgs<NounsHomeFidgetSettings>> = ({ settings }) => {
  const headingsFontFamily = settings?.headingsFontFamily || "var(--user-theme-headings-font)";
  const headingsFontColor = settings?.headingsFontColor || "var(--user-theme-headings-font-color)";
  const bodyFontFamily = settings?.fontFamily || "var(--user-theme-font)";
  const bodyFontColor = settings?.fontColor || "var(--user-theme-font-color)";

  return (
    <div
      style={{
        fontFamily: bodyFontFamily,
        color: bodyFontColor,
        // Provide local overrides for theme variables used by the hero heading
        ["--user-theme-headings-font"]: headingsFontFamily,
        ["--user-theme-headings-font-color"]: headingsFontColor,
      } as React.CSSProperties as any}
      className="size-full"
    >
      <BaseNounsHomeFidget />
    </div>
  );
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

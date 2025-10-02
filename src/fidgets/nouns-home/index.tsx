import React from "react";
import FontSelector from "@/common/components/molecules/FontSelector";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
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
  fidgetName: "Nouns Auction",
  icon: 0x1f5bc,
  fields: [
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint:
        "Body font for the fidget. Set to Theme Font to inherit your Space settings.",
      default: "Poppins",
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
      default: "Londrina Solid",
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

const resolveFont = (value: string | undefined, themeVar: string) => {
  if (!value) return themeVar;
  const cfg = FONT_FAMILY_OPTIONS_BY_NAME[value as keyof typeof FONT_FAMILY_OPTIONS_BY_NAME];
  // If it's a known font name, use its Next/font variable font-family
  if (cfg?.config?.style?.fontFamily) return cfg.config.style.fontFamily as string;
  return value; // already a CSS var or concrete font-family
};

const NounsHomeFidget: React.FC<FidgetArgs<NounsHomeFidgetSettings>> = ({ settings }) => {
  const headingsFontFamily = resolveFont(settings?.headingsFontFamily, "var(--user-theme-headings-font)");
  const headingsFontColor = settings?.headingsFontColor || "var(--user-theme-headings-font-color)";
  const bodyFontFamily = resolveFont(settings?.fontFamily, "var(--user-theme-font)");
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
  title: "Nouns Auction",
  description: "Nouns auction UI inside nounspace",
  version: "1.0.0",
};

const NounsHomeModule = {
  fidget: NounsHomeFidget,
  properties: nounsHomeProperties,
} as FidgetModule<FidgetArgs<NounsHomeFidgetSettings>>;

export { BaseNounsHomeFidget as NounsHomeFidget };
export default NounsHomeModule;

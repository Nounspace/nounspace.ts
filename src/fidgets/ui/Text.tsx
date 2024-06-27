import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
import { FontFamily, Color } from "@/common/lib/theme";

export type TextFidgetSettings = {
  title?: string;
  text: string;
  fontFamily: FontFamily;
  fontColor: Color;
  headingsFontFamily: FontFamily;
  headingsFontColor: Color;
  background: Color;
};

export const textConfig: FidgetProperties = {
  fidgetName: "text",
  icon: 0x1f4c4,
  fields: [
    {
      fieldName: "title",
      default: "Text Fidget",
      required: false,
      inputSelector: TextInput,
    },
    {
      fieldName: "text",
      default: "Jot down your ideas and grow them.",
      required: true,
      inputSelector: TextInput,
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
    },
    {
      fieldName: "fontColor",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: ColorSelector,
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: FontSelector,
    },
    {
      fieldName: "headingsFontColor",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: ColorSelector,
    },
    {
      fieldName: "background",
      default: "",
      required: false,
      inputSelector: ColorSelector,
    },
    {
      fieldName: "css",
      default: "",
      required: false,
      inputSelector: CSSInput,
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 3,
    maxWidth: 36,
  },
};

export const Text: React.FC<FidgetArgs<TextFidgetSettings>> = ({
  settings,
}) => {
  return (
    <div
      style={{
        background: settings.background,
        height: "100%",
      }}
    >
      {settings?.title && (
        <CardHeader className="p-4 pb-2">
          <CardTitle
            className="text-2xl font-bold"
            style={{
              fontFamily: settings.headingsFontFamily,
              color: settings.headingsFontColor,
            }}
          >
            {settings.title}
          </CardTitle>
        </CardHeader>
      )}
      {settings?.text && (
        <CardContent className="p-4 pt-2">
          <CardDescription
            className="text-base font-normal text-black dark:text-white"
            style={{
              fontFamily: settings.fontFamily,
              color: settings.fontColor,
            }}
          >
            {settings.text}
          </CardDescription>
        </CardContent>
      )}
    </div>
  );
};

export default {
  fidget: Text,
  properties: textConfig,
} as FidgetModule<FidgetArgs<TextFidgetSettings>>;

import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
import { FontFamily, Color } from "@/common/lib/theme";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

export type TextFidgetSettings = {
  title?: string;
  text: string;
  fontFamily: FontFamily;
  fontColor: Color;
  headingsFontFamily: FontFamily;
  headingsFontColor: Color;
  background: Color;
  fidgetBorderWidth: string;
  fidgetBorderColor: Color;
  fidgetShadow: string;
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
      group: "settings",
    },
    {
      fieldName: "text",
      default: "Jot down your ideas and grow them.",
      required: true,
      inputSelector: CSSInput,
      group: "settings",
    },
    {
      fieldName: "fontFamily",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "var(--user-theme-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "background",
      default: "var(--user-theme-fidget-background)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "fidgetBorderWidth",
      default: "var(--user-theme-fidget-border-width)",
      required: false,
      inputSelector: BorderSelector,
      group: "style",
    },
    {
      fieldName: "fidgetBorderColor",
      default: "var(--user-theme-fidget-border-color)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "fidgetShadow",
      default: "var(--user-theme-fidget-shadow)",
      required: false,
      inputSelector: ShadowSelector,
      group: "style",
    },
    {
      fieldName: "css",
      default: "",
      required: false,
      inputSelector: CSSInput,
      group: "code",
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
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
        // Not visible because of the outer div having overflow: hidden
        boxShadow: settings.fidgetShadow,
        overflow: "auto",
        scrollbarWidth: "none",
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
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={MarkdownRenderers}
            >
              {settings.text}
            </ReactMarkdown>
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

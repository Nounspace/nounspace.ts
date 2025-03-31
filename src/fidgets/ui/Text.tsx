import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import CSSInput from "@/common/components/molecules/CSSInput";
import FontSelector from "@/common/components/molecules/FontSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultStyleFields } from "../helpers";

export type TextFidgetSettings = {
  title?: string;
  text: string;
  urlColor: string;
} & FidgetSettingsStyle;

export const textConfig: FidgetProperties = {
  fidgetName: "Text",
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
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      ),
      group: "style",
    },
    {
      fieldName: "urlColor",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      ),
      default: "blue",
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      ),
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      default: "var(--user-theme-headings-font-color)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      ),
      group: "style",
    },
    ...defaultStyleFields,
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
              components={MarkdownRenderers(settings.urlColor)}
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

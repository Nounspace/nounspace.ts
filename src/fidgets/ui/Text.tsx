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
  fontFamily?: string;
  fontColor?: string;
  headingsFontFamily?: string;
  headingsFontColor?: string;
} & FidgetSettingsStyle;

const defaultText = `Add formatted text, links, images, or even code blocks with the Text Fidget. To format your text or embed content such as images, use Markdown Syntax.`;


export const textConfig: FidgetProperties = {
  fidgetName: "Text",
  icon: 0x1f4c4,
  fields: [
    {
      fieldName: "title",
      displayName: "Title",
      displayNameHint: "Optional title for your Text Fidget.",
      default: "Text Fidget",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "text",
      displayName: "Text",
      displayNameHint: "Input text to display and use Markdown Syntax to format or embed content like images.",
      default: defaultText,
      required: true,
      inputSelector: CSSInput,
      group: "settings",
    },
    {
      fieldName: "fontFamily",
      displayName: "Font Family",
      displayNameHint: "Font used for the text input (body text). Set to Theme Font to inherit the Body Font from the Theme.",
      default: "var(--user-theme-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      displayName: "Font Color",
      displayNameHint: "Color used for the text input (body text)",
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
      fieldName: "urlColor",
      displayName: "URL Color",
      displayNameHint: "Color used for links in the text input (body text).",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-link-color)"
          defaultColor="#0000FF"
          colorType="link color"
        />
      ),
      default: "var(--user-theme-link-color)",
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      displayName: "Headings Font Family",
      displayNameHint: "Font used for the title input. Set to Theme Font to inherit the Title Font from the Theme.",
      default: "var(--user-theme-headings-font)",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "headingsFontColor",
      displayName: "Headings Font Color",
      displayNameHint: "Color used for the title input",
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
        fontFamily: settings.fontFamily,
        height: "100%",
        color: settings.fontColor,
        background: settings.background,
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
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
              fontFamily: settings.headingsFontFamily || "var(--user-theme-headings-font)",
              color: settings.headingsFontColor || "var(--user-theme-headings-font-color)",
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
              fontFamily: settings.fontFamily || "var(--user-theme-font)",
              color: settings.fontColor || "var(--user-theme-font-color)",
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
import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultStyleFields } from "../helpers";
import { FidgetSettingsStyle } from "@/common/fidgets";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

export type TableFidgetSettings = {
  title?: string;
  table: string;
} & FidgetSettingsStyle;

export const tableConfig: FidgetProperties = {
  fidgetName: "Table",
  icon: 0x1f4c4,
  fields: [
    {
      fieldName: "title",
      default: "Table Fidget",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "table",
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

export const Table: React.FC<FidgetArgs<TableFidgetSettings>> = ({
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
            className="table-2xl font-bold"
            style={{
              fontFamily: settings.headingsFontFamily,
              color: settings.headingsFontColor,
            }}
          >
            {settings.title}
          </CardTitle>
        </CardHeader>
      )}
      {settings?.table && (
        <CardContent className="p-4 pt-2">
          <CardDescription
            className="table-base font-normal table-black dark:table-white"
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
              {settings.table}
            </ReactMarkdown>
          </CardDescription>
        </CardContent>
      )}
    </div>
  );
};

export default {
  fidget: Table,
  properties: tableConfig,
} as FidgetModule<FidgetArgs<TableFidgetSettings>>;

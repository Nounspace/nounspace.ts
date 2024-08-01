import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import CSSInput from "@/common/components/molecules/CSSInput";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import { defaultStyleFields } from "../helpers";
import { FidgetSettingsStyle } from "@/common/fidgets";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/common/components/atoms/card";
import LinksInput from "./LinksInput";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/common/components/atoms/avatar"; // Adjust import path as needed
import ColorPicker from "react-best-gradient-color-picker";
import { ColorRing } from "react-loader-spinner";

export type Link = {
  text: string;
  url: string;
  avatar?: string;
};

export type TextFidgetSettings = {
  title?: string;
  links: Link[];
  itemBackground: string;
} & FidgetSettingsStyle;

export const textConfig: FidgetProperties = {
  fidgetName: "Links",
  icon: 0x26d3,
  fields: [
    {
      fieldName: "title",
      default: "My Links",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "links",
      default: [],
      required: true,
      inputSelector: LinksInput,
      group: "settings",
    },
    {
      fieldName: "headingsFontFamily",
      default: "var(--user-theme-headings-font)",
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
      fieldName: "itemBackground",
      default: "linear-gradient(to right, #dbd81f, #ffffff)",
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
    minHeight: 1,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

export const Links: React.FC<FidgetArgs<TextFidgetSettings>> = ({
  settings,
}) => {
  const links = Array.isArray(settings.links) ? settings.links : [];

  return (
    <div
      style={{
        fontFamily: settings.headingsFontFamily,
        background: settings.background,
        height: "100%",
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
        boxShadow: settings.fidgetShadow,
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      {settings?.title && (
        <CardHeader className="p-1">
          <center>
            <CardTitle
              className="text-2xl font-bold"
              style={{
                fontFamily: settings.headingsFontFamily,
                color: settings.fontColor,
              }}
            >
              {settings.title}
            </CardTitle>
          </center>
        </CardHeader>
      )}
      {links.length > 0 &&
        links.map((link, index) => (
          <CardContent
            style={{
              background: settings.itemBackground,
            }}
            className="p-1 flex items-center justify-between m-1 bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg"
            key={index}
          >
            {link.avatar ? (
              <Avatar className="mr-4 flex-shrink-0">
                <AvatarImage src={link.avatar} alt={link.text} />
                <AvatarFallback>
                  <span className="sr-only">{link.text}</span>
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="mr-4 flex-shrink-0">
                <AvatarImage src="/images/logo.png" alt={link.text} />
                <AvatarFallback>
                  <span className="sr-only">{link.text}</span>
                </AvatarFallback>
              </Avatar>
            )}

            <CardDescription
              className="text-base font-normal text-black dark:text-white flex-grow"
              style={{
                fontFamily: settings.fontFamily,
                color: settings.fontColor,
              }}
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </CardDescription>
          </CardContent>
        ))}
    </div>
  );
};

export default {
  fidget: Links,
  properties: textConfig,
} as FidgetModule<FidgetArgs<TextFidgetSettings>>;

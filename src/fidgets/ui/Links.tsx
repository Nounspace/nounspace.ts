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
} from "@/common/components/atoms/avatar";
import SwitchButton, {
  ViewMode,
} from "@/common/components/molecules/ViewSelector";

export type Link = {
  text: string;
  url: string;
  avatar?: string;
  description?: string;
};

export type LinkFidgetSettings = {
  title?: string;
  links: Link[];
  itemBackground: string;
  viewMode: ViewMode;
  description?: string;
} & FidgetSettingsStyle;

export const linkConfig: FidgetProperties = {
  fidgetName: "Links",
  icon: 0x26d3,
  fields: [
    {
      fieldName: "title",
      default: "Awesome Links",
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
      fieldName: "viewMode",
      default: "grid",
      required: false,
      inputSelector: SwitchButton,
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "Londrina Solid",
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

export const Links: React.FC<FidgetArgs<LinkFidgetSettings>> = ({
  settings,
}) => {
  const links = Array.isArray(settings.links) ? settings.links : [];
  const isGridView = settings.viewMode === "grid";

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
        padding: "1rem",
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

      <div className={isGridView ? "grid grid-cols-3 gap-4" : "flex flex-col"}>
        {links.length > 0 &&
          links.map((link, index) => (
            <CardContent
              style={{
                background: settings.itemBackground,
                wordWrap: "break-word",
                maxHeight: "200px",
                height: "auto",
                display: "flex",
                flexDirection: isGridView ? "column" : "row",
                alignItems: "flex-start",
              }}
              className={
                isGridView
                  ? "p-4 flex flex-col items-start justify-between m-1 bg-gradient-to-r from-gray-100 to-gray-300 rounded-md"
                  : "p-2 flex items-center justify-between m-1 bg-gradient-to-r from-gray-100 to-gray-300 rounded-md pl-3"
              }
              key={index}
            >
              {link.avatar ? (
                <Avatar className={isGridView ? "mb-2" : "mr-4 flex-shrink-0"}>
                  <AvatarImage src={link.avatar} alt={link.text} />
                  <AvatarFallback>
                    <span className="sr-only">{link.text}</span>
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className={isGridView ? "mb-4" : "mr-4 flex-shrink-0"}>
                  <AvatarImage src="/images/logo.png" alt={link.text} />
                  <AvatarFallback>
                    <span className="sr-only">{link.text}</span>
                  </AvatarFallback>
                </Avatar>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <CardDescription
                    className="items-start text-base font-normal text-black dark:text-white flex-grow"
                    style={{
                      fontFamily: settings.fontFamily,
                      color: settings.fontColor,
                      textAlign: "left",
                      wordWrap: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {link.text && link.url ? (
                      <p>{link.text}</p>
                    ) : (
                      <p>{link.url}</p>
                    )}
                  </CardDescription>
                  {link.description && (
                    <p
                      className="text-sm font-normal text-gray-500 dark:text-gray-400"
                      style={{
                        wordWrap: "break-word",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {link.description}
                    </p>
                  )}
                </a>
              </div>
            </CardContent>
          ))}
      </div>
    </div>
  );
};

export default {
  fidget: Links,
  properties: linkConfig,
} as FidgetModule<FidgetArgs<LinkFidgetSettings>>;

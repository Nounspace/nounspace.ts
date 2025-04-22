import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import CSSInput from "@/common/components/molecules/CSSInput";
import FontSelector from "@/common/components/molecules/FontSelector";
import LinksInput from "@/common/components/molecules/LinksInput";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import TextInput from "@/common/components/molecules/TextInput";
import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import SwitchButton, {
  ViewMode,
} from "@/common/components/molecules/ViewSelector";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { mobileStyleSettings } from "../helpers";

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
  DescriptionColor: string;
  HeaderColor: string;
  headingsFontFamily: string;
  fontFamily: string;
} & FidgetSettingsStyle;

export const linkConfig: FidgetProperties = {
  fidgetName: "Links",
  icon: 0x26d3,
  mobileIcon: <BsLink45Deg size={26} />,
  fields: [
    ...mobileStyleSettings,
    {
      fieldName: "title",
      default: "My Links",
      required: false,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "links",
      default: [
        {
          text: "Nouns",
          url: "https://nouns.wtf",
          avatar: "https://nouns.wtf/static/media/noggles.7644bfd0.svg",
          description: "Funds ideas",
        },
      ],
      required: true,
      inputSelector: LinksInput,
      group: "settings",
    },
    {
      fieldName: "viewMode",
      default: "list",
      required: false,
      inputSelector: SwitchButton,
      group: "style",
    },
    {
      fieldName: "headingsFontFamily",
      default: "Theme Headings Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontFamily",
      default: "Theme Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "HeaderColor",
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
    {
      fieldName: "DescriptionColor",
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
      fieldName: "itemBackground",
      default: "var(--user-theme-fidget-background)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-background)"
          defaultColor="#FFFFFF"
          colorType="background"
        />
      ),
      group: "style",
    },
    {
      fieldName: "background",
      default: "var(--user-theme-fidget-background)",
      required: false,
      inputSelector: (props) => (
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-background)"
          defaultColor="#FFFFFF"
          colorType="background color"
        />
      ),
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
    minWidth: 2,
    maxWidth: 36,
  },
};

export const Links: React.FC<FidgetArgs<LinkFidgetSettings>> = ({
  settings,
}) => {
  const links = Array.isArray(settings.links) ? settings.links : [];
  const isGridView = settings.viewMode === "grid";

  const isThemeHeadingsFont = (value: string) => {
    if (!value) return true;
    return value === "Theme Headings Font" ||
      value === "var(--user-theme-headings-font)" ||
      value.includes("Theme Headings Font");
  };

  const isThemeBodyFont = (value: string) => {
    if (!value) return true;
    return value === "Theme Font" ||
      value === "var(--user-theme-font)" ||
      value.includes("Theme Font");
  };

  // Combined function to get the source of the headers
  const getHeadingsFontFamily = () => {
    if (isThemeHeadingsFont(settings.headingsFontFamily)) {
      return "var(--user-theme-headings-font)";
    }
    
    if (settings.headingsFontFamily === "Londrina Solid") {
      const root = document.documentElement;
      const themeFont = getComputedStyle(root).getPropertyValue('--user-theme-headings-font').trim();
      if (themeFont) {
        return themeFont;
      }
    }
    
    return settings.headingsFontFamily;
  };

  // Combined function to get the body source
  const getFontFamily = () => {
    if (isThemeBodyFont(settings.fontFamily)) {
      return "var(--user-theme-font)";
    }
    return settings.fontFamily;
  };

  return (
    <div
      style={{
        fontFamily: getFontFamily(),
        background: settings.background,
        height: "100%",
        borderWidth: settings.fidgetBorderWidth,
        borderColor: settings.fidgetBorderColor,
        boxShadow: settings.fidgetShadow,
        overflow: "auto",
        scrollbarWidth: "none",
        padding: "0.5rem",
        borderRadius: "1rem",
      }}
    >
      {settings?.title && (
        <CardHeader className="p-1 pl-2">
          <CardTitle
            className="text-2xl font-bold"
            style={{
              fontFamily: getHeadingsFontFamily(),
              color: settings.HeaderColor,
            }}
          >
            {settings.title}
          </CardTitle>
        </CardHeader>
      )}

      <div className={isGridView ? "grid grid-cols-3 gap-4" : "flex flex-col"}>
        {links.length > 0 &&
          links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CardContent
                style={{
                  background: settings.itemBackground,
                  wordWrap: "break-word",
                  maxHeight: "200px",
                  height: "auto",
                  display: "flex",
                  flexDirection: isGridView ? "column" : "row",
                  padding: isGridView ? "1rem" : "0.5rem",
                  margin: isGridView ? "0.25rem" : "0.5rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "transform 0.3s",
                }}
                className={
                  isGridView
                    ? "p-4 flex flex-col items-start justify-between m-1 bg-gradient-to-r from-gray-100 to-gray-300 rounded-md hover:scale-105"
                    : "p-2 flex items-center justify-between m-2 bg-gradient-to-r from-gray-100 to-gray-300 rounded-md hover:scale-105"
                }
                key={index}
              >
                {link.avatar ? (
                  <Avatar
                    className={isGridView ? "mb-2" : "mr-2 flex-shrink-0"}
                  >
                    <AvatarImage
                      style={{ padding: "5px" }}
                      src={link.avatar}
                      alt={link.text}
                    />
                    <AvatarFallback>
                      <span className="sr-only">{link.text}</span>
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar
                    className={isGridView ? "mb-2" : "mr-2 flex-shrink-0"}
                  >
                    <AvatarImage
                      src="/images/chainEmoji.png"
                      style={{ padding: "5px" }}
                      alt={link.text}
                    />
                    <AvatarFallback>
                      <span className="sr-only">{link.text}</span>
                    </AvatarFallback>
                  </Avatar>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <CardDescription
                    className="items-start text-base font-normal text-black dark:text-white flex-grow"
                    style={{
                      fontFamily: getHeadingsFontFamily(),
                      color: settings.HeaderColor,
                      textAlign: "left",
                      wordWrap: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxHeight: "3rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
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
                      className="text-sm font-normal"
                      style={{
                        wordWrap: "break-word",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: settings.DescriptionColor,
                        fontFamily: getFontFamily(),
                      }}
                    >
                      {link.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </a>
          ))}
      </div>
    </div>
  );
};

export default {
  fidget: Links,
  properties: linkConfig,
} as FidgetModule<FidgetArgs<LinkFidgetSettings>>;

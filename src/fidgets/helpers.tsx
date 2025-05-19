import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import SwitchButton from "@/common/components/molecules/SwitchButton";
import TextInput from "@/common/components/molecules/TextInput";
import React from "react";

import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { type FidgetFieldConfig } from "@/common/fidgets";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

export const MOBILE_DISPLAY_NAME_MAX_LENGTH = 10;

export const validateMobileDisplayName = (value: string): boolean => {
  if (!value) return true; // Optional field
  return value.length <= MOBILE_DISPLAY_NAME_MAX_LENGTH;
};

export const WithMargin: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div
    className={mergeClasses(
      //Aplica menos preenchimento em telas pequenas
      "pt-2.5 sm:pt-2.5 xs:pt-1.5 md:pt-2.5 lg:pt-2.5"
    )}
  >
    {children}
  </div>
);


export const mobileStyleSettings = [
  {
    fieldName: "showOnMobile",
    displayName: "Show on Mobile",
    displayNameHint: "Toggle whether this Fidget should be visible on mobile devices.",
    default: true,
    required: false,
    inputSelector: (props) => (
      <WithMargin>
        <SwitchButton {...props} />
      </WithMargin>
    ),
    group: "style",
  },
  {
    fieldName: "customMobileDisplayName",
    displayName: "Mobile Display Name",
    displayNameHint: "Set a custom name to display for this Fidget in the mobile nav.",
    validator: validateMobileDisplayName,
    inputSelector: (props) => (
      <WithMargin>
        <TextInput {...props} />
      </WithMargin>
    ),
    required: false,
    group: "style",
  },
] as FidgetFieldConfig[];

export const defaultStyleFields = [
  ...mobileStyleSettings,
  {
    fieldName: "background",
    displayName: "Background",
    displayNameHint: "Color used for the background of the Fidget.",
    default: "var(--user-theme-fidget-background)",
    required: false,
    inputSelector: (props) => (
      <WithMargin>
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-background)"
          defaultColor="#FFFFFF"
          colorType="background"
        />
      </WithMargin>
    ),
    group: "style",
  },
  {
    fieldName: "fidgetBorderWidth",
    displayName: "Fidget Border Width",
    displayNameHint: "Width of the Fidget's border. Set to Theme Border to inherit the Fidget Border Width from the Theme. Set to None to remove the border.",
    default: "var(--user-theme-fidget-border-width)",
    required: false,
    inputSelector: (props) => (
      <WithMargin>
        <BorderSelector
          {...props}
          hideGlobalSettings={false}
        />
      </WithMargin>
    ),
    group: "style",
  },
  {
    fieldName: "fidgetBorderColor",
    displayName: "Fidget Border Color",
    displayNameHint: "Color of the Fidget's Border.",
    default: "var(--user-theme-fidget-border-color)",
    required: false,
    inputSelector: (props) => (
      <WithMargin>
        <ThemeColorSelector
          {...props}
          themeVariable="var(--user-theme-fidget-border-color)"
          defaultColor="#000000"
          colorType="border color"
        />
      </WithMargin>
    ),
    group: "style",
  },
  {
    fieldName: "fidgetShadow",
    displayName: "Fidget Shadow",
    displayNameHint: "Shadow for the Fidget. Set to Theme Shadow to inherit the Fidget Shadow Settings from the Theme. Set to None to remove the shadow.",
    default: "var(--user-theme-fidget-shadow)",
    required: false,
    inputSelector: (props) => (
      <WithMargin>
        <ShadowSelector
          {...props}
          hideGlobalSettings={false}
        />
      </WithMargin>
    ),
    group: "style",
  },
] as FidgetFieldConfig[];

export const transformUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes('/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }
  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[?&].*)?/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  const vimeoRegex =
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?|$)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

export const ErrorWrapper: React.FC<{
  message: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ message, icon }) => {
  return (
    <div className="flex flex-col gap-1 size-full items-center justify-center text-center p-4 absolute top-0 right-0 bottom-0 left-0">
      {icon && <div className="text-[20px]">{icon}</div>}
      <p className="text-gray-400 font-semibold text-sm leading-tight max-w-[60ch]">
        {message}
      </p>
    </div>
  );
};

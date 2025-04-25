import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import SwitchButton from "@/common/components/molecules/SwitchButton";
import TextInput from "@/common/components/molecules/TextInput";
import React from "react";

import ThemeColorSelector from "@/common/components/molecules/ThemeColorSelector";
import { type FidgetFieldConfig } from "@/common/fidgets";

export const MOBILE_DISPLAY_NAME_MAX_LENGTH = 10;

export const validateMobileDisplayName = (value: string): boolean => {
  if (!value) return true; // Optional field
  return value.length <= MOBILE_DISPLAY_NAME_MAX_LENGTH;
};

export const mobileStyleSettings = [
  {
    fieldName: "showOnMobile",
    displayName: "Show on Mobile",
    default: true,
    required: false,
    inputSelector: SwitchButton,
    group: "style",
  },
  {
    fieldName: "customMobileDisplayName",
    displayName: "Mobile Display Name",
    displayNameHint: "Set a custom name to display for this Fidget in the mobile nav.",
    validator: validateMobileDisplayName,
    inputSelector: TextInput,
    required: false,
    group: "style",
  },
] as FidgetFieldConfig[];

export const defaultStyleFields = [
  ...mobileStyleSettings,
  {
    fieldName: "background",
    displayName: "Background",
    displayNameHint: "Color used for the background of the Image Fidget",
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
    fieldName: "fidgetBorderWidth",
    displayName: "FidgetBorderWidth",
    displayNameHint: "Width of the Fidget's border. Set to Theme Border to inherit the Fidget Border Width from the Theme. Set to None to remove the border.",
    default: "var(--user-theme-fidget-border-width)",
    required: false,
    inputSelector: BorderSelector,
    group: "style",
  },
  {
    fieldName: "fidgetBorderColor",
    displayName: "FidgetBorderColor",
    displayNameHint: "Color of the Fidget's Border.",
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
    displayName: "FidgetShadow",
    displayNameHint: "Shadow for the Fidget. Set to Theme Shadow to inherit the Fidget Shadow Settings from the Theme. Set to None to remove the shadow.",
    default: "var(--user-theme-fidget-shadow)",
    required: false,
    inputSelector: ShadowSelector,
    group: "style",
  },
] as FidgetFieldConfig[];

export const transformUrl = (url: string) => {
  if (url && url.match(/youtube\.com\/watch\?v=/)) {
    return url.replace("watch?v=", "embed/");
  }
  if (url && url.match(/vimeo\.com\/\d+/)) {
    return url.replace("vimeo.com", "player.vimeo.com/video");
  }
  if (url && url.match(/odysee\.com\/@/)) {
    return url.replace("odysee.com", "odysee.com/$/embed");
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

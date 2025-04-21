import React from "react";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import TextInput from "@/common/components/molecules/TextInput";
import SwitchButton from "@/common/components/molecules/SwitchButton";

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
    default: "var(--user-theme-fidget-background)",
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
    displayName: "fidgetBorderColor",
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
    default: "var(--user-theme-fidget-border-color)",
  },
  {
    fieldName: "fidgetShadow",
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

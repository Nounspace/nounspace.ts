import ColorSelector from "@/common/components/molecules/ColorSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";

import { type FidgetFieldConfig } from "@/common/fidgets";

export const defaultStyleFields: FidgetFieldConfig[] = [
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
];

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

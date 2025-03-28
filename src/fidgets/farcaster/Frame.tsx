import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import FrameEmbed from "./components/Embeds/FrameEmbed";
import { isValidUrl } from "@/common/lib/utils/url";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";

export type FrameFidgetSettings = {
  url: string;
} & FidgetSettingsStyle;

const frameProperties: FidgetProperties = {
  fidgetName: "Farcaster Frame",
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
    },
    {
      fieldName: "background",
      default: "transparent",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "fidgetBorderWidth",
      default: "transparent",
      required: false,
      inputSelector: BorderSelector,
      group: "style",
    },
    {
      fieldName: "fidgetBorderColor",
      default: "transparent",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "fidgetShadow",
      default: "none",
      required: false,
      inputSelector: ShadowSelector,
      group: "style",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
  icon: 0x23f9, // ⏹
};

const DISALLOW_URL_PATTERNS = [
  /javascript:/i,
  /^data:/i,
  /<script/i,
  /%3Cscript/i,
];

const ErrorWrapper: React.FC<{
  message: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ message, icon }) => {
  return (
    <div className="flex flex-col gap-1 size-full items-center justify-center text-center p-4 absolute top-0 right-0 bottom-0 left-0 bg-white border border-gray-200 rounded-lg">
      {icon && <div className="text-[20px]">{icon}</div>}
      <p className="text-gray-400 font-semibold text-sm leading-tight max-w-[60ch]">
        {message}
      </p>
    </div>
  );
};

const Frame: React.FC<FidgetArgs<FrameFidgetSettings>> = ({
  settings: { url },
}) => {
  const isValid = isValidUrl(url);
  const sanitizedUrl = useSafeUrl(url, DISALLOW_URL_PATTERNS);

  if (!url) {
    return <ErrorWrapper icon="➕" message="Provide a URL to display here." />;
  }

  if (!isValid) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }

  if (!sanitizedUrl) {
    return (
      <ErrorWrapper
        icon="🔒"
        message={`This URL cannot be displayed due to security restrictions (${url}).`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
      <FrameEmbed url={url} />
    </div>
  );
};

const exp = {
  fidget: Frame,
  properties: frameProperties,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;

export default exp;

import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import FrameEmbed from "./components/Embeds/FrameEmbed";
import { isValidUrl } from "@/common/lib/utils/url";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";

export type FrameFidgetSettings = {
  url: string;
};

const frameProperties: FidgetProperties = {
  fidgetName: "Frame",
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
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
    <div className="flex flex-col gap-1 size-full items-center justify-center text-center p-4 absolute top-0 right-0 bottom-0 left-0">
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

  return <FrameEmbed url={url} />;
};

const exp = {
  fidget: Frame,
  properties: frameProperties,
} as FidgetModule<FidgetArgs<FrameFidgetSettings>>;

export default exp;

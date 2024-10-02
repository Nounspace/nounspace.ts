import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { isValidUrl } from "@/common/lib/utils/url";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { defaultStyleFields } from "@/fidgets/helpers";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import { transformUrl } from "@/fidgets/helpers";
export type IFrameFidgetSettings = {
  url: string;
  size: number;
} & FidgetSettingsStyle;

const DISALLOW_URL_PATTERNS = [
  /javascript:/i,
  /^data:/i,
  /<script/i,
  /%3Cscript/i,
];

const frameConfig: FidgetProperties = {
  fidgetName: "iFrame",
  icon: 0x1f310, // 🌐
  fields: [
    {
      fieldName: "url",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    ...defaultStyleFields,
    {
      fieldName: "size",
      required: false,
      inputSelector: IFrameWidthSlider,
      group: "style",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

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

const IFrame: React.FC<FidgetArgs<IFrameFidgetSettings>> = ({
  settings: { url, size = 1 },
}) => {
  const isValid = isValidUrl(url);
  const sanitizedUrl = useSafeUrl(url, DISALLOW_URL_PATTERNS);
  const transformedUrl = transformUrl(sanitizedUrl || "");
  if (!url) {
    return <ErrorWrapper icon="➕" message="Provide a URL to display here." />;
  }

  if (!isValid) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }

  if (!transformedUrl) {
    return (
      <ErrorWrapper
        icon="🔒"
        message={`This URL cannot be displayed due to security restrictions (${url}).`}
      />
    );
  }

  const scaleValue = size;

  return (
    <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <iframe
        src={transformedUrl}
        title="IFrame Fidget"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          transform: `scale(${scaleValue})`,
          transformOrigin: "0 0",
          width: `${100 / scaleValue}%`,
          height: `${100 / scaleValue}%`,
        }}
        className="size-full"
      />
    </div>
  );
};

export default {
  fidget: IFrame,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<IFrameFidgetSettings>>;

import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { isValidUrl } from "@/common/lib/utils/url";
import { defaultStyleFields, ErrorWrapper } from "@/fidgets/helpers";
import React from "react";

export type VideoFidgetSettings = {
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
  fidgetName: "Video",
  icon: 0x1f4fa, // 📺
  fields: [
    {
      fieldName: "url",
      displayName: "URL",
      displayNameHint: "Paste the URL to the Frame you want to embed",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    ...defaultStyleFields,
    {
      fieldName: "size",
      displayName: "Scale",
      displayNameHint: "Drag the slider to adjust the image size.",
      required: false,
      inputSelector: IFrameWidthSlider,
      default: 1,
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

const VideoFidget: React.FC<FidgetArgs<VideoFidgetSettings>> = ({
  settings: { url, size = 1 },
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
    <div 
      style={{ 
        overflow: "hidden", 
        width: "100%", 
        height: "100%",
      }}
    >
      <iframe
        src={sanitizedUrl}
        title="Frame Fidget"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          transform: `scale(${size})`,
          transformOrigin: "0 0",
          width: `${100 / size}%`,
          height: `${100 / size}%`,
          border: "none"
        }}
        className="size-full"
      />
    </div>
  );
};

export default {
  fidget: VideoFidget,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<VideoFidgetSettings>>;

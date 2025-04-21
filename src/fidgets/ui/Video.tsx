import React, { useEffect } from "react";
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
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { ErrorWrapper } from "@/fidgets/helpers";

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
      required: true,
      default: "https://www.youtube.com/watch?v=lOzCA7bZG_k",
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

const VideoFidget: React.FC<FidgetArgs<VideoFidgetSettings>> = ({
  settings: { url, size = 1 },
}) => {
  const isMobile = useIsMobile();
  
  const isValid = isValidUrl(url);
  const sanitizedUrl = useSafeUrl(url, DISALLOW_URL_PATTERNS);
  const transformedUrl = transformUrl(sanitizedUrl || "");

  if (!url) {
    return (
      <ErrorWrapper
        icon="➕"
        message="Provide a YouTube/Vimeo URL to display here."
      />
    );
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
    <div style={{ 
      overflow: "hidden", 
      width: "100%", 
      height: "100%",
      position: "relative"
    }}>
      <iframe
        src={transformedUrl}
        title="IFrame Fidget"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allowFullScreen
        style={{
          transform: isMobile ? 'none' : `scale(${scaleValue})`,
          transformOrigin: "0 0",
          width: isMobile ? "100%" : `${100 / scaleValue}%`,
          height: isMobile ? "100%" : `${100 / scaleValue}%`,
          // Removed absolute positioning which was causing issues
          position: "relative",
          top: 0,
          left: 0,
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

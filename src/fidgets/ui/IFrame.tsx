import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { debounce } from "lodash";
import { isValidHttpUrl } from "@/common/lib/utils/url";
import { defaultStyleFields, ErrorWrapper, transformUrl, WithMargin } from "@/fidgets/helpers";
import React, { useEffect, useMemo, useState } from "react";
import { BsCloud, BsCloudFill } from "react-icons/bs";

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
  fidgetName: "Web Embed",
  mobileFidgetName: "Site",
  icon: 0x1f310, // 🌐
  mobileIcon: <BsCloud size={24} />,
  mobileIconSelected: <BsCloudFill size={24} />,
  fields: [
    {
      fieldName: "url",
      displayName: "URL",
      displayNameHint: "Paste the URL of the webpage you'd like to embed",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
   ...defaultStyleFields,
    {
      fieldName: "size",
      displayName: "Size",
      displayNameHint: "Drag the slider to adjust the zoom level.",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <IFrameWidthSlider {...props} />
        </WithMargin>
      ),
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

const IFrame: React.FC<FidgetArgs<IFrameFidgetSettings>> = ({
  settings: { url, size = 1 },
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [embedInfo, setEmbedInfo] = useState<{
    directEmbed: boolean;
    url?: string;
    iframelyHtml?: string | null;
  } | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const debouncedSetUrl = useMemo(
    () => debounce((value: string) => setDebouncedUrl(value), 300),
    [],
  );

  useEffect(() => {
    debouncedSetUrl(url);
    return () => {
      debouncedSetUrl.cancel();
    };
  }, [url, debouncedSetUrl]);

  const isValid = isValidHttpUrl(debouncedUrl);
  const sanitizedUrl = useSafeUrl(debouncedUrl, DISALLOW_URL_PATTERNS);
  const transformedUrl = transformUrl(sanitizedUrl || "");
  const scaleValue = size;

  useEffect(() => {
    async function checkEmbedInfo() {
      if (!isValid || !sanitizedUrl) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/iframely?url=${encodeURIComponent(sanitizedUrl)}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to get embed information"
          );
        }

        const data = await response.json();
        setEmbedInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching embed info:", err);
      } finally {
        setLoading(false);
      }
    }

    checkEmbedInfo();
  }, [sanitizedUrl, isValid]);

  if (!url) {
    return <ErrorWrapper icon="➕" message="Provide a URL to display here." />;
  }

  if (!isValid) {
    return <ErrorWrapper icon="❌" message={`This URL is invalid (${url}).`} />;
  }

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ErrorWrapper icon="⏳" message="Loading embed..." />
      </div>
    );
  }

  if (error) {
    return <ErrorWrapper icon="⚠️" message={error} />;
  }

  if (!embedInfo) {
    return <ErrorWrapper icon="🔍" message="Checking embeddability..." />;
  }

  if (embedInfo.directEmbed && transformedUrl) {
    return (
      <div
        style={{ overflow: "hidden", width: "100%" }}
        className="h-[calc(100dvh-156px)] md:h-full"
      >
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
  }

  if (!embedInfo.directEmbed && embedInfo.iframelyHtml) {
    return (
      <div
        style={{ overflow: "hidden", width: "100%", height: "100%" }}
        dangerouslySetInnerHTML={{ __html: embedInfo.iframelyHtml }}
      />
    );
  }

  return (
    <ErrorWrapper
      icon="🔒"
      message={`This URL cannot be displayed due to security restrictions (${url}).`}
    />
  );
};

export default {
  fidget: IFrame,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<IFrameFidgetSettings>>;

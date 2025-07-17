import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import CropControls from "@/common/components/molecules/CropControls";
import { FidgetArgs, FidgetModule, FidgetProperties, type FidgetSettingsStyle } from "@/common/fidgets";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { debounce } from "lodash";
import { isValidHttpUrl } from "@/common/lib/utils/url";
import { defaultStyleFields, ErrorWrapper, transformUrl, WithMargin } from "@/fidgets/helpers";
import { getNounsFallbackUrl, useUrlFallback } from "@/common/lib/utils/urlFallback";
import React, { useEffect, useMemo, useState } from "react";
import { BsCloud, BsCloudFill } from "react-icons/bs";

export type IFrameFidgetSettings = {
  url: string;
  size: number;
  cropOffsetX: number;
  cropOffsetY: number;
  isScrollable: boolean;
} & FidgetSettingsStyle;

const DISALLOW_URL_PATTERNS = [/javascript:/i, /^data:/i, /<script/i, /%3Cscript/i];

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
    {
      fieldName: "size",
      displayName: "Zoom Level",
      displayNameHint: "Drag the slider to adjust the zoom level of the iframe content",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <IFrameWidthSlider {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "cropOffsetX",
      displayName: "Horizontal Position",
      displayNameHint: "Adjust the horizontal position of the iframe content",
      required: false,
      default: 0,
      inputSelector: (props) => (
        <WithMargin>
          <CropControls offsetX={props.value || 0} onOffsetXChange={props.onChange} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "cropOffsetY",
      displayName: "Vertical Position",
      displayNameHint: "Adjust the vertical position of the iframe content",
      required: false,
      default: 0,
      inputSelector: (props) => (
        <WithMargin>
          <CropControls offsetY={props.value || 0} onOffsetYChange={props.onChange} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "isScrollable",
      displayName: "Allow Scrolling",
      displayNameHint: "Enable or disable scrolling within the iframe",
      required: false,
      default: false,
      inputSelector: (props) => (
        <WithMargin>
          <CropControls isScrollable={props.value || false} onScrollableChange={props.onChange} />
        </WithMargin>
      ),
      group: "settings",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

// Cache for iframe embed information
const embedCache = new Map<
  string,
  {
    data: {
      directEmbed: boolean;
      url?: string;
      iframelyHtml?: string | null;
    };
    timestamp: number;
    expiresAt: number;
  }
>();

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

const IFrame: React.FC<FidgetArgs<IFrameFidgetSettings>> = ({
  settings: { url, size = 1, cropOffsetX = 0, cropOffsetY = 0, isScrollable = false },
}) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [embedInfo, setEmbedInfo] = useState<{
    directEmbed: boolean;
    url?: string;
    iframelyHtml?: string | null;
  } | null>(null);

  // Use the URL fallback hook to manage fallback logic
  const urlFallback = useUrlFallback(url);
  const currentUrl = urlFallback.currentUrl;
  const hasTriedFallback = urlFallback.hasTriedFallback;

  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const debouncedSetUrl = useMemo(() => debounce((value: string) => setDebouncedUrl(value), 300), []);

  useEffect(() => {
    debouncedSetUrl(currentUrl);

    setError(null);
    setEmbedInfo(null);

    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    return () => {
      debouncedSetUrl.cancel();
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [currentUrl, url, debouncedSetUrl, loadingTimeout]);

  // Debug logging to verify fallback logic
  console.log(
    `🔧 IFrame Debug - Original: ${url}, Current: ${currentUrl}, Fallback: ${hasTriedFallback}`
  );

  const isValid = isValidHttpUrl(currentUrl);
  const sanitizedUrl = useSafeUrl(currentUrl, DISALLOW_URL_PATTERNS);
  const transformedUrl = transformUrl(sanitizedUrl || "");
  const scaleValue = size;

  // Handle iframe loading errors
  const handleIframeError = () => {
    if (!urlFallback.tryFallback("Failed to load the webpage")) {
      setError("Failed to load the webpage");
    }
  };

  useEffect(() => {
    async function checkEmbedInfo() {
      if (!isValid || !sanitizedUrl) return;

      console.log(`🔍 Checking embed info for: ${sanitizedUrl}`);
      console.log(`🎯 Original URL: ${url}`);
      console.log(`📍 Current URL: ${currentUrl}`);
      console.log(`🔄 Has tried fallback: ${hasTriedFallback}`);

      // Check cache first
      const cached = embedCache.get(sanitizedUrl);
      const now = Date.now();

      if (cached && now < cached.expiresAt) {
        // Use cached data
        console.log(`💾 Using cached data for: ${sanitizedUrl}`);
        setEmbedInfo(cached.data);
        return;
      }

      // Clear expired cache entry
      if (cached && now >= cached.expiresAt) {
        embedCache.delete(sanitizedUrl);
      }

      setLoading(true);
      setError(null);

      // Set a timeout for the request - shorter for nouns.com to detect issues faster
      const isNounsComUrl = currentUrl.includes('nouns.com');
      const timeoutDuration = isNounsComUrl ? 5000 : 8000; // 5s for nouns.com, 8s for others
      
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Request timeout for ${currentUrl} after ${timeoutDuration}ms, trying fallback`);
        if (!urlFallback.tryFallback("Request timed out")) {
          setError("Request timed out");
          setLoading(false);
        }
      }, timeoutDuration);

      setLoadingTimeout(timeoutId);

      try {
        console.log(`🌐 Fetching embed info for: ${sanitizedUrl}`);
        const fetchTimeoutDuration = isNounsComUrl ? 4000 : 7000; // 4s for nouns.com, 7s for others
        const response = await fetch(`/api/iframely?url=${encodeURIComponent(sanitizedUrl)}`, {
          signal: AbortSignal.timeout(fetchTimeoutDuration),
        });

        // Clear timeout if request completes
        clearTimeout(timeoutId);
        setLoadingTimeout(null);

        if (!response.ok) {
          console.log(`❌ Response not OK for ${sanitizedUrl}:`, response.status, response.statusText);
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to get embed information");
        }

        const data = await response.json();
        console.log(`✅ Successfully got embed info for: ${sanitizedUrl}`, data);

        // Cache the result
        embedCache.set(sanitizedUrl, {
          data,
          timestamp: now,
          expiresAt: now + CACHE_DURATION,
        });

        setEmbedInfo(data);
      } catch (err) {
        // Clear timeout
        clearTimeout(timeoutId);
        setLoadingTimeout(null);

        console.log(`🚨 Error fetching embed info for ${sanitizedUrl}:`, err);

        // Try fallback URL if available and not already tried
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        if (!urlFallback.tryFallback(errorMessage)) {
          setError(errorMessage);
          console.error("Error fetching embed info:", err);
        } else {
          return; // This will trigger the effect again with the new URL
        }
      } finally {
        setLoading(false);
      }
    }

    checkEmbedInfo();
  }, [sanitizedUrl, isValid, currentUrl, hasTriedFallback, url]);

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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          gap: "12px",
        }}
      >
        {/* Header skeleton */}
        <div
          style={{
            height: "24px",
            width: "60%",
            backgroundColor: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />

        {/* Content skeleton squares */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "12px",
            flex: 1,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: "80px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom content skeleton */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              height: "16px",
              width: "100%",
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <div
            style={{
              height: "16px",
              width: "80%",
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>
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
        style={{
          overflow: "hidden",
          width: "100%",
          height: isMobile ? "100vh" : "100%",
          position: "relative",
        }}
      >
        {/* Show fallback notification if using fallback URL */}
        {hasTriedFallback && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Fallback URL notification: Using nouns.wtf fallback due to original site being unavailable"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "var(--success-bg, rgba(34, 197, 94, 0.95))",
              color: "var(--success-text, white)",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              zIndex: 1000,
              pointerEvents: "none",
              boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.2))",
              border: "1px solid var(--border-success, rgba(255,255,255,0.2))",
            }}
          >
            ✅ Using nouns.wtf fallback
          </div>
        )}
        {isMobile ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              transform: `translate(${cropOffsetX}%, ${cropOffsetY * 1.6}%)`,
            }}
          >
            <iframe
              src={transformedUrl}
              title="IFrame Fidget"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              onError={handleIframeError}
              style={{
                width: "100%",
                height: "100%",
                overflow: isScrollable ? "auto" : "hidden",
              }}
              className="size-full"
            />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${size})`,
              transformOrigin: "0 0",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${100 / size}%`,
                height: `${100 / size}vh`,
                transform: `translate(${cropOffsetX}%, ${cropOffsetY * 1.8}%)`,
              }}
            >
              <iframe
                src={transformedUrl}
                title="IFrame Fidget"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                onError={handleIframeError}
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: isScrollable ? "auto" : "hidden",
                }}
                className="size-full"
              />
            </div>
          </div>
        )}
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

  return <ErrorWrapper icon="🔒" message={`This URL cannot be displayed due to security restrictions (${url}).`} />;
};

export default {
  fidget: IFrame,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<IFrameFidgetSettings>>;

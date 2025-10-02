import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import HTMLInput from "@/common/components/molecules/HTMLInput";
import CropControls from "@/common/components/molecules/CropControls";
import { FidgetArgs, FidgetModule, FidgetProperties, type FidgetSettingsStyle } from "@/common/fidgets";
import useSafeUrl from "@/common/lib/hooks/useSafeUrl";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { debounce } from "lodash";
import { isValidHttpUrl } from "@/common/lib/utils/url";
import { defaultStyleFields, ErrorWrapper, transformUrl, WithMargin } from "@/fidgets/helpers";
import React, { useEffect, useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { BsCloud, BsCloudFill } from "react-icons/bs";
import { useMiniApp } from "@/common/utils/useMiniApp";
import { MINI_APP_PROVIDER_METADATA } from "@/common/providers/MiniAppSdkProvider";

const DEFAULT_SANDBOX_RULES =
  "allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

const FALLBACK_BASE_URL = "https://nounspace.app/";

const ensureSandboxRules = (sandbox?: string) => {
  const rules = new Set(
    DEFAULT_SANDBOX_RULES.split(/\s+/).filter((token) => token.length > 0),
  );

  if (sandbox) {
    sandbox
      .split(/\s+/)
      .filter((token) => token.length > 0)
      .forEach((token) => rules.add(token));
  }

  rules.add("allow-same-origin");

  return Array.from(rules).join(" ");
};

const sanitizeMiniAppNavigationTarget = (targetUrl: string) => {
  const fallback = "about:blank";

  if (!targetUrl) {
    return fallback;
  }

  try {
    const base =
      typeof window !== "undefined" && window.location
        ? window.location.href
        : FALLBACK_BASE_URL;
    const parsed = new URL(targetUrl, base);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch (error) {
    console.warn("Blocked unsupported mini app navigation target", error);
  }

  return fallback;
};

const resolveAllowedEmbedSrc = (src?: string | null): string | null => {
  if (!src) {
    return null;
  }

  try {
    const base =
      typeof window !== "undefined" && window.location
        ? window.location.href
        : FALLBACK_BASE_URL;
    const parsed = new URL(src, base);

    if (parsed.protocol === "https:") {
      return parsed.toString();
    }

    if (parsed.protocol === "about:" && parsed.href === "about:blank") {
      return parsed.href;
    }
  } catch (error) {
    console.warn("Rejected unsupported iframe src", error);
    return null;
  }

  return null;
};

type IframeAttributeMap = Record<string, string>;

const createMiniAppBootstrapSrcDoc = (targetUrl: string) => {
  const safeTargetUrl = sanitizeMiniAppNavigationTarget(targetUrl);
  const iconPath = MINI_APP_PROVIDER_METADATA.iconPath;
  const providerInfoScript = `
        var providerInfo = parentWindow.__nounspaceMiniAppProviderInfo;
        if (!providerInfo) {
          var icon;
          try {
            icon = new URL(${JSON.stringify(iconPath)}, (window.parent && window.parent.location ? window.parent.location.origin : window.location.origin)).toString();
          } catch (err) {
            icon = ${JSON.stringify(iconPath)};
          }
          providerInfo = {
            uuid: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.uuid)},
            name: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.name)},
            icon: icon,
            rdns: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.rdns)}
          };
        }
      `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><script>(function(){
      try {
        var parentWindow = window.parent;
        if (!parentWindow) {
          return;
        }

        var provider = parentWindow.__nounspaceMiniAppEthProvider;
        if (!provider) {
          return;
        }

        var providerInfo;
        ${providerInfoScript}

        var buildProviderProxy = function(originalProvider) {
          if (!originalProvider || (typeof originalProvider !== "object" && typeof originalProvider !== "function")) {
            return originalProvider;
          }

          var proxy = {};

          var bindMethod = function(key) {
            try {
              var value = originalProvider[key];
              if (typeof value === "function") {
                proxy[key] = value.bind(originalProvider);
                return;
              }
            } catch (err) {}

            try {
              Object.defineProperty(proxy, key, {
                configurable: true,
                enumerable: false,
                get: function() {
                  try {
                    return originalProvider[key];
                  } catch (err) {
                    return undefined;
                  }
                },
                set: function(newValue) {
                  try {
                    originalProvider[key] = newValue;
                  } catch (err) {}
                }
              });
            } catch (err) {}
          };

          [
            "request",
            "send",
            "sendAsync",
            "on",
            "once",
            "off",
            "addListener",
            "removeListener",
            "removeAllListeners",
            "emit"
          ].forEach(bindMethod);

          try {
            var descriptor = Object.getOwnPropertyDescriptor(originalProvider, "providers");
            if (descriptor && descriptor.get) {
              Object.defineProperty(proxy, "providers", {
                configurable: true,
                enumerable: false,
                get: function() {
                  try {
                    var result = descriptor.get.call(originalProvider) || [];
                    return Array.isArray(result) ? result.concat(proxy) : [proxy];
                  } catch (err) {
                    return [proxy];
                  }
                }
              });
            } else if (Array.isArray(originalProvider.providers)) {
              proxy.providers = originalProvider.providers.concat(proxy);
            } else {
              proxy.providers = [proxy];
            }
          } catch (err) {
            proxy.providers = [proxy];
          }

          proxy.isMiniAppProvider = true;
          proxy.isNounspaceMiniAppProvider = true;

          return proxy;
        };

        var proxyProvider = buildProviderProxy(provider) || provider;

        var announceDetail = Object.freeze({
          info: providerInfo,
          provider: proxyProvider
        });

        var announceTo = function(targetWindow) {
          if (!targetWindow) {
            return;
          }
          try {
            targetWindow.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: announceDetail }));
          } catch (err) {
            console.warn("Mini app provider announce failed", err);
          }
        };

        try {
          Object.defineProperty(window, "ethereum", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: proxyProvider
          });
        } catch (err) {
          window.ethereum = proxyProvider;
        }

        try {
          if (!window.ethereum.providers || window.ethereum.providers.indexOf(proxyProvider) === -1) {
            window.ethereum.providers = Array.isArray(window.ethereum.providers)
              ? window.ethereum.providers.concat(proxyProvider)
              : [proxyProvider];
          }
        } catch (err) {}

        try {
          window.dispatchEvent(new Event("ethereum#initialized"));
        } catch (err) {}

        announceTo(window);

        try {
          parentWindow.addEventListener("eip6963:announceProvider", function(event) {
            if (!event || !event.detail) {
              return;
            }
            try {
              window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: event.detail }));
            } catch (innerErr) {
              console.warn("Failed to forward announce event to mini app iframe", innerErr);
            }
          });
        } catch (err) {}

        try {
          window.addEventListener("eip6963:requestProvider", function() {
            try {
              parentWindow.dispatchEvent(new Event("eip6963:requestProvider"));
            } catch (innerErr) {
              console.warn("Failed to forward provider request event from mini app iframe", innerErr);
            }
          });
        } catch (err) {}

        try {
          parentWindow.dispatchEvent(new Event("eip6963:requestProvider"));
        } catch (requestErr) {}
      } catch (err) {
        console.error("Mini app provider bootstrap failed", err);
      }

      setTimeout(function(){
        var target = ${JSON.stringify(safeTargetUrl)};
        if (target) {
          window.location.replace(target);
        }
      }, 0);
    })();</script></body></html>`;
};

const parseIframeAttributes = (html: string | null): IframeAttributeMap | null => {
  if (typeof window === "undefined" || !html) {
    return null;
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const iframe = document.querySelector("iframe");
    if (!iframe) {
      return null;
    }

    const attributes: IframeAttributeMap = {};
    Array.from(iframe.attributes).forEach((attr) => {
      attributes[attr.name.toLowerCase()] = attr.value;
    });

    return attributes;
  } catch (error) {
    console.error("Failed to parse iframe embed code", error);
    return null;
  }
};

export type IFrameFidgetSettings = {
  url: string;
  embedScript?: string;
  size: number;
  cropOffsetX: number;
  cropOffsetY: number;
  isScrollable: boolean;
} & FidgetSettingsStyle;

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
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "embedScript",
      displayName: "Embed Script",
      displayNameHint: "Paste an iframe embed code instead of a URL",
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <HTMLInput {...props} />
        </WithMargin>
      ),
      group: "code",
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
  settings: {
    url,
    embedScript,
    size = 1,
    cropOffsetX = 0,
    cropOffsetY = 0,
    isScrollable = false
  },
}) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [embedInfo, setEmbedInfo] = useState<{
    directEmbed: boolean;
    url?: string;
    iframelyHtml?: string | null;
  } | null>(null);

  const [debouncedUrl, setDebouncedUrl] = useState(url);

  const debouncedSetUrl = useMemo(() => debounce((value: string) => setDebouncedUrl(value), 300), []);

  const { isInMiniApp } = useMiniApp();
  const isMiniAppEnvironment = isInMiniApp === true;

  const [sanitizedEmbedAttributes, setSanitizedEmbedAttributes] =
    useState<IframeAttributeMap | null>(null);
  const [iframelyEmbedAttributes, setIframelyEmbedAttributes] =
    useState<IframeAttributeMap | null>(null);

  const sanitizedEmbedScript = useMemo(() => {
    if (!embedScript) return null;
    const clean = DOMPurify.sanitize(embedScript, {
      ALLOWED_TAGS: ["iframe"],
      ALLOWED_ATTR: [
        "src",
        "width",
        "height",
        "frameborder",
        "allow",
        "allowfullscreen",
        "loading",
        "referrerpolicy",
      ],
    });
    return clean.trim() ? clean : null;
  }, [embedScript]);

  useEffect(() => {
    debouncedSetUrl(url);
    return () => {
      debouncedSetUrl.cancel();
    };
  }, [url, debouncedSetUrl]);

  useEffect(() => {
    if (!sanitizedEmbedScript) {
      setSanitizedEmbedAttributes(null);
      return;
    }

    setSanitizedEmbedAttributes(parseIframeAttributes(sanitizedEmbedScript));
  }, [sanitizedEmbedScript]);

  useEffect(() => {
    if (!embedInfo?.iframelyHtml) {
      setIframelyEmbedAttributes(null);
      return;
    }

    setIframelyEmbedAttributes(parseIframeAttributes(embedInfo.iframelyHtml));
  }, [embedInfo?.iframelyHtml]);

  const isValid = isValidHttpUrl(debouncedUrl);
  const sanitizedUrl = useSafeUrl(debouncedUrl);
  const transformedUrl = transformUrl(sanitizedUrl || "");
  // Scale value is set from size prop
  const _scaleValue = size;

  useEffect(() => {
    if (sanitizedEmbedScript) return;
    async function checkEmbedInfo() {
      if (!isValid || !sanitizedUrl) return;

      // Check cache first
      const cached = embedCache.get(sanitizedUrl);
      const now = Date.now();

      if (cached && now < cached.expiresAt) {
        // Use cached data
        setEmbedInfo(cached.data);
        return;
      }

      // Clear expired cache entry
      if (cached && now >= cached.expiresAt) {
        embedCache.delete(sanitizedUrl);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/iframely?url=${encodeURIComponent(sanitizedUrl)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to get embed information");
        }

        const data = await response.json();

        // Cache the result
        embedCache.set(sanitizedUrl, {
          data,
          timestamp: now,
          expiresAt: now + CACHE_DURATION,
        });

        setEmbedInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching embed info:", err);
      } finally {
        setLoading(false);
      }
    }

    checkEmbedInfo();
  }, [sanitizedUrl, isValid, sanitizedEmbedScript]);

  if (sanitizedEmbedScript) {
    if (isMiniAppEnvironment && sanitizedEmbedAttributes?.src) {
      const allowedSrc = resolveAllowedEmbedSrc(sanitizedEmbedAttributes.src);

      if (!allowedSrc) {
        return (
          <ErrorWrapper
            icon="🔒"
            message="This embed source is not allowed in the mini app."
          />
        );
      }

      const allowFullScreen = "allowfullscreen" in sanitizedEmbedAttributes;
      const sandboxRules = ensureSandboxRules(
        sanitizedEmbedAttributes.sandbox,
      );
      const bootstrapDoc = createMiniAppBootstrapSrcDoc(allowedSrc);

      const widthAttr = sanitizedEmbedAttributes.width;
      const heightAttr = sanitizedEmbedAttributes.height;

      return (
        <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
          <iframe
            key={`miniapp-sanitized-${allowedSrc}`}
            srcDoc={bootstrapDoc}
            title={sanitizedEmbedAttributes.title || "IFrame Fidget"}
            sandbox={sandboxRules}
            allow={sanitizedEmbedAttributes.allow}
            referrerPolicy={
              sanitizedEmbedAttributes.referrerpolicy as React.IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"]
            }
            loading={
              sanitizedEmbedAttributes.loading as React.IframeHTMLAttributes<HTMLIFrameElement>["loading"]
            }
            frameBorder={sanitizedEmbedAttributes.frameborder}
            allowFullScreen={allowFullScreen}
            width={widthAttr}
            height={heightAttr}
            style={{
              border: "0",
              width: widthAttr ? undefined : "100%",
              height: heightAttr ? undefined : "100%",
              overflow: isScrollable ? "auto" : "hidden",
            }}
            className="size-full"
          />
        </div>
      );
    }

    return (
      <div
        style={{ overflow: "hidden", width: "100%", height: "100%" }}
        dangerouslySetInnerHTML={{ __html: sanitizedEmbedScript }}
      />
    );
  }

  if (!url) {
    return (
      <ErrorWrapper
        icon="➕"
        message="Provide a URL or embed script to display here."
      />
    );
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
    const miniAppBootstrapDoc = isMiniAppEnvironment
      ? createMiniAppBootstrapSrcDoc(transformedUrl)
      : null;

    return (
      <div
        style={{
          overflow: "hidden",
          width: "100%",
          height: isMobile ? "100vh" : "100%",
          position: "relative",
        }}
      >
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
              key={`iframe-miniapp-${transformedUrl}`}
              src={miniAppBootstrapDoc ? undefined : transformedUrl}
              srcDoc={miniAppBootstrapDoc || undefined}
              title="IFrame Fidget"
              sandbox={DEFAULT_SANDBOX_RULES}
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
                key={`iframe-miniapp-${transformedUrl}`}
                src={miniAppBootstrapDoc ? undefined : transformedUrl}
                srcDoc={miniAppBootstrapDoc || undefined}
                title="IFrame Fidget"
                sandbox={DEFAULT_SANDBOX_RULES}
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
    if (isMiniAppEnvironment && iframelyEmbedAttributes?.src) {
      if (!isValidHttpUrl(iframelyEmbedAttributes.src)) {
        return (
          <div
            style={{ overflow: "hidden", width: "100%", height: "100%" }}
            dangerouslySetInnerHTML={{ __html: embedInfo.iframelyHtml }}
          />
        );
      }

      let safeSrc: string;

      try {
        safeSrc = new URL(iframelyEmbedAttributes.src).toString();
      } catch (error) {
        console.warn("Rejected unsupported IFramely iframe src", error);
        return (
          <div
            style={{ overflow: "hidden", width: "100%", height: "100%" }}
            dangerouslySetInnerHTML={{ __html: embedInfo.iframelyHtml }}
          />
        );
      }

      const allowFullScreen = "allowfullscreen" in iframelyEmbedAttributes;
      const sandboxRules = ensureSandboxRules(iframelyEmbedAttributes.sandbox);
      const bootstrapDoc = createMiniAppBootstrapSrcDoc(safeSrc);

      const widthAttr = iframelyEmbedAttributes.width;
      const heightAttr = iframelyEmbedAttributes.height;

      return (
        <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
          <iframe
            key={`miniapp-iframely-${safeSrc}`}
            srcDoc={bootstrapDoc}
            title={iframelyEmbedAttributes.title || "IFrame Fidget"}
            sandbox={sandboxRules}
            allow={iframelyEmbedAttributes.allow}
            referrerPolicy={
              iframelyEmbedAttributes.referrerpolicy as React.IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"]
            }
            loading={
              iframelyEmbedAttributes.loading as React.IframeHTMLAttributes<HTMLIFrameElement>["loading"]
            }
            frameBorder={iframelyEmbedAttributes.frameborder}
            allowFullScreen={allowFullScreen}
            width={widthAttr}
            height={heightAttr}
            style={{
              border: "0",
              width: widthAttr ? undefined : "100%",
              height: heightAttr ? undefined : "100%",
              overflow: isScrollable ? "auto" : "hidden",
            }}
            className="size-full"
          />
        </div>
      );
    }

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

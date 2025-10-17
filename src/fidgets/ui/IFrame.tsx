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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type MiniAppEthereumProvider = {
  request?: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type MiniAppProviderInfo = NonNullable<Window["__nounspaceMiniAppProviderInfo"]>;

const createMiniAppBootstrapSrcDoc = (targetUrl: string, bridgeId: string) => {
  const safeTargetUrl = sanitizeMiniAppNavigationTarget(targetUrl);
  const scriptLines = [
    "(function(){",
    "  try {",
    `    var BRIDGE_ID = ${JSON.stringify(bridgeId)};`,
    `    var TARGET_URL = ${JSON.stringify(safeTargetUrl)};`,
    "    var parentWindow = null;",
    "    try { parentWindow = window.parent; } catch (err) {}",
    "    var navigateToTarget = function() {",
    "      if (!TARGET_URL) { return; }",
    "      try {",
    "        window.location.replace(TARGET_URL);",
    "      } catch (replaceErr) {",
    "        try {",
    "          window.location.href = TARGET_URL;",
    "        } catch (hrefErr) {}",
    "      }",
    "    };",
    "    if (!parentWindow) {",
    "      navigateToTarget();",
    "      return;",
    "    }",
    "",
    "    var computeDefaultProviderInfo = function() {",
    `      var icon = ${JSON.stringify(MINI_APP_PROVIDER_METADATA.iconPath)};`,
    "      try {",
    "        var baseOrigin = (window.parent && window.parent.location) ? window.parent.location.origin : window.location.origin;",
    `        icon = new URL(${JSON.stringify(MINI_APP_PROVIDER_METADATA.iconPath)}, baseOrigin).toString();`,
    "      } catch (err) {}",
    "      return {",
    `        uuid: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.uuid)},`,
    `        name: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.name)},`,
    "        icon: icon,",
    `        rdns: ${JSON.stringify(MINI_APP_PROVIDER_METADATA.rdns)}`,
    "      };",
    "    };",
    "",
    "    var providerProxy = {};",
    "    var pendingRequests = {};",
    "    var pendingTimeouts = {};",
    "    var nextRequestId = 1;",
    "    var readyWaiters = [];",
    "    var isReady = false;",
    "    var listenerCounts = {};",
    "    var localListeners = {};",
    "    var providerInfo = computeDefaultProviderInfo();",
    "    var providerProperties = {};",
    "    var MAX_REQUEST_TIMEOUT = 60000;",
    "    var READY_TIMEOUT = 15000;",
    "",
    "    var rejectReadyWaiters = function(message) {",
    "      var error = new Error(message || 'Wallet provider unavailable');",
    "      var waiters = readyWaiters.slice();",
    "      readyWaiters.length = 0;",
    "      for (var i = 0; i < waiters.length; i++) {",
    "        try { waiters[i].reject(error); } catch (err) {}",
    "      }",
    "    };",
    "",
    "    var fulfillReady = function() {",
    "      if (isReady) { return; }",
    "      isReady = true;",
    "      var waiters = readyWaiters.slice();",
    "      readyWaiters.length = 0;",
    "      for (var i = 0; i < waiters.length; i++) {",
    "        try { waiters[i].resolve(); } catch (err) {}",
    "      }",
    "    };",
    "",
    "    var resetReady = function() {",
    "      isReady = false;",
    "    };",
    "",
    "    var waitForReady = function() {",
    "      if (isReady) {",
    "        return Promise.resolve();",
    "      }",
    "      return new Promise(function(resolve, reject) {",
    "        var timeoutId = setTimeout(function() {",
    "          reject(new Error('Wallet provider not available'));",
    "        }, READY_TIMEOUT);",
    "        readyWaiters.push({",
    "          resolve: function() {",
    "            clearTimeout(timeoutId);",
    "            resolve();",
    "          },",
    "          reject: function(error) {",
    "            clearTimeout(timeoutId);",
    "            reject(error);",
    "          }",
    "        });",
    "      });",
    "    };",
    "",
    "    var sendMessage = function(type, payload) {",
    "      try {",
    "        parentWindow.postMessage({",
    "          __nounspaceMiniApp: true,",
    "          bridgeId: BRIDGE_ID,",
    "          type: type,",
    "          payload: payload || {}",
    "        }, '*');",
    "      } catch (err) {}",
    "    };",
    "",
    "    var clearPendingRequest = function(requestId) {",
    "      if (pendingTimeouts[requestId]) {",
    "        clearTimeout(pendingTimeouts[requestId]);",
    "        delete pendingTimeouts[requestId];",
    "      }",
    "      if (pendingRequests[requestId]) {",
    "        delete pendingRequests[requestId];",
    "      }",
    "    };",
    "",
    "    var applyProperties = function(properties) {",
    "      if (!properties || typeof properties !== 'object') {",
    "        return;",
    "      }",
    "      for (var key in properties) {",
    "        if (!Object.prototype.hasOwnProperty.call(properties, key)) { continue; }",
    "        try {",
    "          providerProxy[key] = properties[key];",
    "        } catch (err) {}",
    "      }",
    "    };",
    "",
    "    var announceProvider = function() {",
    "      try {",
    "        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {",
    "          detail: { info: providerInfo, provider: providerProxy }",
    "        }));",
    "      } catch (err) {}",
    "    };",
    "",
    "    var ensureListenerArray = function(eventName) {",
    "      if (!localListeners[eventName]) {",
    "        localListeners[eventName] = [];",
    "      }",
    "      return localListeners[eventName];",
    "    };",
    "",
    "    var subscribeRemote = function(eventName) {",
    "      if (listenerCounts[eventName] > 0) {",
    "        return;",
    "      }",
    "      sendMessage('subscribe', { event: eventName });",
    "    };",
    "",
    "    var unsubscribeRemote = function(eventName) {",
    "      if (listenerCounts[eventName] > 0) {",
    "        return;",
    "      }",
    "      sendMessage('unsubscribe', { event: eventName });",
    "    };",
    "",
    "    var emitEvent = function(eventName, args) {",
    "      var listeners = ensureListenerArray(eventName);",
    "      if (!listeners.length) {",
    "        return;",
    "      }",
    "      var safeArgs = Array.isArray(args) ? args : [args];",
    "      listeners.slice().forEach(function(listener) {",
    "        try {",
    "          listener.apply(providerProxy, safeArgs);",
    "        } catch (err) {",
    "          try {",
    "            console.error('Mini app provider listener error', err);",
    "          } catch (innerErr) {}",
    "        }",
    "      });",
    "    };",
    "",
    "    var addListener = function(eventName, listener) {",
    "      if (typeof eventName !== 'string' || typeof listener !== 'function') {",
    "        return providerProxy;",
    "      }",
    "      var listeners = ensureListenerArray(eventName);",
    "      listeners.push(listener);",
    "      listenerCounts[eventName] = (listenerCounts[eventName] || 0) + 1;",
    "      if (listenerCounts[eventName] === 1) {",
    "        subscribeRemote(eventName);",
    "      }",
    "      return providerProxy;",
    "    };",
    "",
    "    var removeListener = function(eventName, listener) {",
    "      if (typeof eventName !== 'string') {",
    "        return providerProxy;",
    "      }",
    "      var listeners = ensureListenerArray(eventName);",
    "      if (typeof listener === 'function') {",
    "        for (var i = listeners.length - 1; i >= 0; i--) {",
    "          if (listeners[i] === listener) {",
    "            listeners.splice(i, 1);",
    "            listenerCounts[eventName] = Math.max((listenerCounts[eventName] || 1) - 1, 0);",
    "          }",
    "        }",
    "      } else {",
    "        listenerCounts[eventName] = 0;",
    "        listeners.length = 0;",
    "      }",
    "      if ((listenerCounts[eventName] || 0) === 0) {",
    "        listeners.length = 0;",
    "        unsubscribeRemote(eventName);",
    "      }",
    "      return providerProxy;",
    "    };",
    "",
    "    providerProxy.on = addListener;",
    "    providerProxy.addListener = addListener;",
    "    providerProxy.off = removeListener;",
    "    providerProxy.removeListener = removeListener;",
    "    providerProxy.removeAllListeners = function(eventName) {",
    "      removeListener(eventName);",
    "      return providerProxy;",
    "    };",
    "    providerProxy.once = function(eventName, listener) {",
    "      if (typeof eventName !== 'string' || typeof listener !== 'function') {",
    "        return providerProxy;",
    "      }",
    "      var onceListener = function() {",
    "        removeListener(eventName, onceListener);",
    "        listener.apply(providerProxy, arguments);",
    "      };",
    "      addListener(eventName, onceListener);",
    "      return providerProxy;",
    "    };",
    "    providerProxy.emit = function(eventName) {",
    "      var args = [].slice.call(arguments, 1);",
    "      emitEvent(eventName, args);",
    "      return providerProxy;",
    "    };",
    "",
    "    providerProxy.request = function(args) {",
    "      if (!args || typeof args !== 'object') {",
    "        return Promise.reject(new Error('Invalid request arguments'));",
    "      }",
    "      var method = args.method;",
    "      if (typeof method !== 'string') {",
    "        return Promise.reject(new Error('Invalid request method'));",
    "      }",
    "      var params = args.params;",
    "      return waitForReady().then(function() {",
    "        return new Promise(function(resolve, reject) {",
    "          var requestId = BRIDGE_ID + ':' + (nextRequestId++);",
    "          pendingRequests[requestId] = { resolve: resolve, reject: reject };",
    "          var timeoutId = setTimeout(function() {",
    "            if (pendingRequests[requestId]) {",
    "              delete pendingRequests[requestId];",
    "              reject(new Error('Wallet request timed out'));",
    "            }",
    "          }, MAX_REQUEST_TIMEOUT);",
    "          pendingTimeouts[requestId] = timeoutId;",
    "          sendMessage('request', { requestId: requestId, method: method, params: params });",
    "        });",
    "      });",
    "    };",
    "",
    "    providerProxy.send = function(methodOrPayload, paramsOrCallback) {",
    "      if (typeof methodOrPayload === 'string') {",
    "        return providerProxy.request({ method: methodOrPayload, params: paramsOrCallback });",
    "      }",
    "      var payload = methodOrPayload || {};",
    "      if (typeof paramsOrCallback === 'function') {",
    "        providerProxy.request({ method: payload.method, params: payload.params })",
    "          .then(function(result) {",
    "            paramsOrCallback(null, { jsonrpc: payload.jsonrpc || '2.0', id: payload.id, result: result });",
    "          })",
    "          .catch(function(error) {",
    "            paramsOrCallback(error, null);",
    "          });",
    "        return;",
    "      }",
    "      return providerProxy.request(payload);",
    "    };",
    "",
    "    providerProxy.sendAsync = function(payload, callback) {",
    "      if (typeof callback === 'function') {",
    "        providerProxy.send(payload, callback);",
    "        return;",
    "      }",
    "      return providerProxy.send(payload);",
    "    };",
    "",
    "    providerProxy.isMiniAppProvider = true;",
    "    providerProxy.isNounspaceMiniAppProvider = true;",
    "",
    "    try {",
    "      Object.defineProperty(providerProxy, 'providers', {",
    "        configurable: true,",
    "        enumerable: false,",
    "        get: function() {",
    "          return [providerProxy];",
    "        }",
    "      });",
    "    } catch (err) {",
    "      providerProxy.providers = [providerProxy];",
    "    }",
    "",
    "    var handleResponse = function(message) {",
    "      var payload = message && message.payload ? message.payload : {};",
    "      var requestId = payload.requestId;",
    "      if (!requestId || !pendingRequests[requestId]) {",
    "        return;",
    "      }",
    "      var pending = pendingRequests[requestId];",
    "      clearPendingRequest(requestId);",
    "      if (payload.error) {",
    "        var error = new Error(payload.error.message || 'Request failed');",
    "        if (typeof payload.error.code !== 'undefined') {",
    "          error.code = payload.error.code;",
    "        }",
    "        if (typeof payload.error.data !== 'undefined') {",
    "          error.data = payload.error.data;",
    "        }",
    "        pending.reject(error);",
    "        return;",
    "      }",
    "      pending.resolve(payload.result);",
    "    };",
    "",
    "    window.addEventListener('message', function(event) {",
    "      if (!event || !event.data || typeof event.data !== 'object') {",
    "        return;",
    "      }",
    "      var message = event.data;",
    "      if (!message.__nounspaceMiniApp || message.bridgeId !== BRIDGE_ID) {",
    "        return;",
    "      }",
    "      if (message.type === 'providerReady') {",
    "        providerInfo = message.payload && message.payload.providerInfo ? message.payload.providerInfo : providerInfo;",
    "        providerProperties = message.payload && message.payload.properties ? message.payload.properties : providerProperties;",
    "        applyProperties(providerProperties);",
    "        fulfillReady();",
    "        try { window.dispatchEvent(new Event('ethereum#initialized')); } catch (err) {}",
    "        announceProvider();",
    "      } else if (message.type === 'providerUnavailable') {",
    "        resetReady();",
    "        rejectReadyWaiters('Wallet provider unavailable');",
    "      } else if (message.type === 'response') {",
    "        handleResponse(message);",
    "      } else if (message.type === 'event') {",
    "        var payload = message.payload || {};",
    "        emitEvent(payload.event, payload.args);",
    "      }",
    "    });",
    "",
    "    window.addEventListener('eip6963:requestProvider', function() {",
    "      if (isReady) {",
    "        announceProvider();",
    "      } else {",
    "        sendMessage('requestAnnounce', {});",
    "      }",
    "    });",
    "",
    "    try {",
    "      Object.defineProperty(window, 'ethereum', {",
    "        configurable: true,",
    "        enumerable: false,",
    "        writable: true,",
    "        value: providerProxy",
    "      });",
    "    } catch (err) {",
    "      window.ethereum = providerProxy;",
    "    }",
    "",
    "    try {",
    "      if (!Array.isArray(window.ethereum.providers) || window.ethereum.providers.indexOf(providerProxy) === -1) {",
    "        window.ethereum.providers = [providerProxy];",
    "      }",
    "    } catch (err) {}",
    "",
    "    sendMessage('init', {});",
    "    sendMessage('requestAnnounce', {});",
    "",
    "    setTimeout(navigateToTarget, 0);",
    "  } catch (err) {",
    "    try {",
    "      console.error('Mini app provider bootstrap failed', err);",
    "    } catch (innerErr) {}",
    "    try {",
    "      setTimeout(navigateToTarget, 0);",
    "    } catch (scheduleErr) {",
    "      try {",
    "        navigateToTarget();",
    "      } catch (fallbackErr) {}",
    "    }",
    "  }",
    "})();",
  ];

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><script>${scriptLines.join(
    "\\n",
  )}</script></body></html>`;
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

  const [bridgeId] = useState(
    () =>
      `nounspace-miniapp-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeWindowRef = useRef<Window | null>(null);
  const pendingBridgeMessagesRef = useRef<Array<Record<string, unknown>>>([]);
  const iframeLoadListenerRef = useRef<((event: Event) => void) | null>(null);
  const providerRef = useRef<MiniAppEthereumProvider | null>(null);
  const providerInfoRef = useRef<MiniAppProviderInfo | null>(null);
  const activeSubscriptionsRef = useRef(new Set<string>());
  const subscriptionHandlersRef = useRef(
    new Map<string, (...args: unknown[]) => void>(),
  );

  const deliverBridgeMessage = useCallback(
    (targetWindow: Window, message: Record<string, unknown>) => {
      try {
        targetWindow.postMessage(
          {
            __nounspaceMiniApp: true,
            bridgeId,
            ...message,
          },
          "*",
        );
      } catch (error) {
        console.warn("Failed to post message to mini app iframe", error);
      }
    },
    [bridgeId],
  );

  const flushPendingBridgeMessages = useCallback(() => {
    const targetWindow =
      iframeWindowRef.current ?? iframeRef.current?.contentWindow ?? null;

    if (!targetWindow) {
      return false;
    }

    iframeWindowRef.current = targetWindow;

    if (pendingBridgeMessagesRef.current.length === 0) {
      return true;
    }

    const pending = pendingBridgeMessagesRef.current;
    pendingBridgeMessagesRef.current = [];

    pending.forEach((message) => {
      deliverBridgeMessage(targetWindow, message);
    });

    return true;
  }, [deliverBridgeMessage]);

  const getDefaultProviderInfo = useCallback((): MiniAppProviderInfo => {
    let icon = MINI_APP_PROVIDER_METADATA.iconPath;

    if (typeof window !== "undefined") {
      try {
        icon = new URL(
          MINI_APP_PROVIDER_METADATA.iconPath,
          window.location.origin,
        ).toString();
      } catch (error) {
        console.warn("Failed to resolve mini app provider icon", error);
      }
    }

    return {
      uuid: MINI_APP_PROVIDER_METADATA.uuid,
      name: MINI_APP_PROVIDER_METADATA.name,
      icon,
      rdns: MINI_APP_PROVIDER_METADATA.rdns,
    };
  }, []);

  const postToIframe = useCallback(
    (message: Record<string, unknown>) => {
      const targetWindow =
        iframeWindowRef.current ?? iframeRef.current?.contentWindow ?? null;

      if (!targetWindow) {
        pendingBridgeMessagesRef.current.push(message);
        return;
      }

      iframeWindowRef.current = targetWindow;

      deliverBridgeMessage(targetWindow, message);
    },
    [deliverBridgeMessage],
  );

  const gatherProviderProperties = useCallback(
    (provider: MiniAppEthereumProvider | null): Record<string, unknown> => {
      if (!provider) {
        return {};
      }

      const snapshot: Record<string, unknown> = {
        isMiniAppProvider: true,
        isNounspaceMiniAppProvider: true,
      };

      const propertyKeys = [
        "isMetaMask",
        "isCoinbaseWallet",
        "isWalletConnect",
        "isTrust",
        "isLedger",
        "isRainbow",
        "isPhantom",
        "chainId",
        "selectedAddress",
      ];

      propertyKeys.forEach((key) => {
        const value = (provider as Record<string, unknown>)[key];

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          snapshot[key] = value;
        }
      });

      return snapshot;
    },
    [],
  );

  const detachSubscription = useCallback((eventName: string) => {
    const handler = subscriptionHandlersRef.current.get(eventName);
    if (!handler) {
      return;
    }

    const provider = providerRef.current;
    if (provider && typeof provider.removeListener === "function") {
      try {
        provider.removeListener(eventName, handler);
      } catch (error) {
        console.warn("Failed to detach provider listener", eventName, error);
      }
    }

    subscriptionHandlersRef.current.delete(eventName);
  }, []);

  const detachAllSubscriptions = useCallback(() => {
    subscriptionHandlersRef.current.forEach((_handler, eventName) => {
      detachSubscription(eventName);
    });
    subscriptionHandlersRef.current.clear();
  }, [detachSubscription]);

  const attachSubscription = useCallback(
    (eventName: string) => {
      const provider = providerRef.current;
      if (!provider || typeof provider.on !== "function") {
        return;
      }

      if (subscriptionHandlersRef.current.has(eventName)) {
        return;
      }

      const handler = (...args: unknown[]) => {
        postToIframe({
          type: "event",
          payload: { event: eventName, args },
        });
      };

      try {
        provider.on(eventName, handler);
        subscriptionHandlersRef.current.set(eventName, handler);
      } catch (error) {
        console.warn("Failed to attach provider listener", eventName, error);
      }
    },
    [postToIframe],
  );

  const announceProviderState = useCallback(
    (forceUnavailable = false) => {
      const provider = providerRef.current;

      if (!provider) {
        if (forceUnavailable) {
          postToIframe({ type: "providerUnavailable" });
        }
        return;
      }

      const providerInfo = providerInfoRef.current ?? getDefaultProviderInfo();

      postToIframe({
        type: "providerReady",
        payload: {
          providerInfo,
          properties: gatherProviderProperties(provider),
        },
      });
    },
    [gatherProviderProperties, getDefaultProviderInfo, postToIframe],
  );

  const setBridgeProvider = useCallback(
    (
      provider: MiniAppEthereumProvider | null,
      info: MiniAppProviderInfo | null,
    ) => {
      if (providerRef.current === provider) {
        providerInfoRef.current = info ?? providerInfoRef.current;
        if (provider) {
          announceProviderState();
        } else {
          announceProviderState(true);
        }
        return;
      }

      detachAllSubscriptions();
      providerRef.current = provider;
      providerInfoRef.current = info;

      if (provider) {
        activeSubscriptionsRef.current.forEach((eventName) => {
          attachSubscription(eventName);
        });
        announceProviderState();
      } else {
        announceProviderState(true);
      }
    },
    [announceProviderState, attachSubscription, detachAllSubscriptions],
  );

  const notifyIframeReady = useCallback(() => {
    const hasWindow = flushPendingBridgeMessages();

    if (hasWindow && providerRef.current) {
      announceProviderState();
    }
  }, [announceProviderState, flushPendingBridgeMessages]);

  const miniAppIframeRef = useCallback(
    (node: HTMLIFrameElement | null) => {
      if (iframeRef.current && iframeLoadListenerRef.current) {
        iframeRef.current.removeEventListener(
          "load",
          iframeLoadListenerRef.current,
        );
        iframeLoadListenerRef.current = null;
      }

      iframeRef.current = node;
      iframeWindowRef.current = node?.contentWindow ?? null;

      if (!node) {
        pendingBridgeMessagesRef.current = [];
        iframeLoadListenerRef.current = null;
        return;
      }

      notifyIframeReady();

      const handleLoad = () => {
        iframeWindowRef.current = node.contentWindow ?? null;
        notifyIframeReady();
      };

      node.addEventListener("load", handleLoad);
      iframeLoadListenerRef.current = handleLoad;
    },
    [notifyIframeReady],
  );

  const serializeProviderError = useCallback((error: unknown) => {
    if (error && typeof error === "object") {
      const result: Record<string, unknown> = {
        message: String((error as { message?: unknown }).message ?? error),
      };

      if ("code" in (error as Record<string, unknown>)) {
        result.code = (error as Record<string, unknown>).code;
      }

      if ("data" in (error as Record<string, unknown>)) {
        result.data = (error as Record<string, unknown>).data;
      }

      return result;
    }

    return { message: String(error) };
  }, []);

  const handleBridgeRequest = useCallback(
    (payload: unknown) => {
      if (!payload || typeof payload !== "object") {
        return;
      }

      const { requestId, method, params } = payload as {
        requestId?: string;
        method?: string;
        params?: unknown;
      };

      if (!requestId || typeof requestId !== "string") {
        return;
      }

      const provider = providerRef.current;
      if (!provider || typeof provider.request !== "function" || typeof method !== "string") {
        postToIframe({
          type: "response",
          payload: {
            requestId,
            error: {
              message: "Wallet provider unavailable",
            },
          },
        });
        return;
      }

      Promise.resolve()
        .then(() => provider.request!({ method, params }))
        .then((result) => {
          postToIframe({
            type: "response",
            payload: { requestId, result },
          });
        })
        .catch((error) => {
          postToIframe({
            type: "response",
            payload: {
              requestId,
              error: serializeProviderError(error),
            },
          });
        });
    },
    [postToIframe, serializeProviderError],
  );

  const handleSubscribe = useCallback(
    (payload: unknown) => {
      const eventName = (payload as { event?: unknown })?.event;
      if (typeof eventName !== "string" || !eventName) {
        return;
      }

      activeSubscriptionsRef.current.add(eventName);
      attachSubscription(eventName);
    },
    [attachSubscription],
  );

  const handleUnsubscribe = useCallback(
    (payload: unknown) => {
      const eventName = (payload as { event?: unknown })?.event;
      if (typeof eventName !== "string" || !eventName) {
        return;
      }

      activeSubscriptionsRef.current.delete(eventName);
      detachSubscription(eventName);
    },
    [detachSubscription],
  );

  const handleBridgeMessage = useCallback(
    (event: MessageEvent) => {
      if (!isMiniAppEnvironment) {
        return;
      }

      const message = event.data as
        | {
            __nounspaceMiniApp?: boolean;
            bridgeId?: string;
            type?: string;
            payload?: unknown;
          }
        | undefined;

      if (!message || !message.__nounspaceMiniApp || message.bridgeId !== bridgeId) {
        return;
      }

      if (event.source && typeof (event.source as Window).postMessage === "function") {
        iframeWindowRef.current = event.source as Window;
      }

      switch (message.type) {
        case "init":
          announceProviderState(true);
          break;
        case "request":
          handleBridgeRequest(message.payload);
          break;
        case "subscribe":
          handleSubscribe(message.payload);
          break;
        case "unsubscribe":
          handleUnsubscribe(message.payload);
          break;
        case "requestAnnounce":
          announceProviderState(true);
          break;
        default:
          break;
      }
    },
    [
      announceProviderState,
      bridgeId,
      handleBridgeRequest,
      handleSubscribe,
      handleUnsubscribe,
      isMiniAppEnvironment,
    ],
  );

  useEffect(() => {
    if (!isMiniAppEnvironment) {
      return;
    }

    const listener = (event: MessageEvent) => {
      handleBridgeMessage(event);
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, [handleBridgeMessage, isMiniAppEnvironment]);

  useEffect(() => {
    if (!isMiniAppEnvironment || typeof window === "undefined") {
      return;
    }

    const win = window as Window & {
      __nounspaceMiniAppEthProvider?: MiniAppEthereumProvider;
      __nounspaceMiniAppProviderInfo?: MiniAppProviderInfo | null;
    };

    const currentProvider = win.__nounspaceMiniAppEthProvider ?? null;
    const currentInfo = win.__nounspaceMiniAppProviderInfo ?? null;

    setBridgeProvider(currentProvider ?? null, currentInfo ?? null);

    const handleAnnounce = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail || !detail.info) {
        return;
      }

      if (
        detail.info.uuid &&
        detail.info.uuid !== MINI_APP_PROVIDER_METADATA.uuid
      ) {
        return;
      }

      setBridgeProvider(
        (detail.provider as MiniAppEthereumProvider) ?? null,
        detail.info ?? null,
      );
    };

    window.addEventListener(
      "eip6963:announceProvider",
      handleAnnounce as EventListener,
    );

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnounce as EventListener,
      );
    };
  }, [isMiniAppEnvironment, setBridgeProvider]);

  useEffect(() => {
    if (isMiniAppEnvironment) {
      return;
    }

    activeSubscriptionsRef.current.clear();
    detachAllSubscriptions();
    providerRef.current = null;
    providerInfoRef.current = null;
    iframeWindowRef.current = null;
  }, [detachAllSubscriptions, isMiniAppEnvironment]);

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
      const bootstrapDoc = createMiniAppBootstrapSrcDoc(allowedSrc, bridgeId);

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
            ref={miniAppIframeRef}
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
      ? createMiniAppBootstrapSrcDoc(transformedUrl, bridgeId)
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
              ref={isMiniAppEnvironment ? miniAppIframeRef : undefined}
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
                ref={isMiniAppEnvironment ? miniAppIframeRef : undefined}
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
      const bootstrapDoc = createMiniAppBootstrapSrcDoc(safeSrc, bridgeId);

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
            ref={miniAppIframeRef}
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

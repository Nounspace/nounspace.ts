"use client";

import React, { createContext, useEffect, useState } from "react";
import { sdk as frameSdk, Context } from "@farcaster/frame-sdk";

export const MINI_APP_PROVIDER_METADATA = {
  uuid: "nounspace-miniapp-eth-provider",
  name: "Nounspace Mini App",
  iconPath: "/images/mini_app_icon.png",
  rdns: "wtf.nounspace",
};

declare global {
  interface Window {
    __nounspaceMiniAppEthProvider?: unknown;
    __nounspaceMiniAppProviderInfo?: {
      uuid: string;
      name: string;
      icon: string;
      rdns: string;
    };
  }
}

// Types for the context
type MiniAppContext = {
  isInitializing: boolean;
  isReady: boolean;
  error: Error | null;
  sdk: typeof frameSdk | null;
  frameContext: Context.FrameContext | null;
};

export const MiniAppSdkContext = createContext<MiniAppContext>({
  isInitializing: true,
  isReady: false,
  error: null,
  sdk: null,
  frameContext: null,
});

export const MiniAppSdkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<MiniAppContext>({
    isInitializing: true,
    isReady: false,
    error: null,
    sdk: null,
    frameContext: null,
  });

  useEffect(() => {
    // Only initialize on client side
    // if (typeof window === "undefined") {
    //   return;
    // }

    const initializeSdk = async () => {
      try {
        // Initialize the frame SDK
        await frameSdk.actions.ready();

        // Store the sdk reference
        // Get initial frame context - it's a Promise
        const initialFrameContext = await frameSdk.context;

        // console.log("Frame SDK initialized successfully.", initialFrameContext);

        setState((prev) => ({
          ...prev,
          sdk: frameSdk,
          frameContext: initialFrameContext,
          isInitializing: false,
          isReady: true,
        }));
      } catch (err) {
        console.error("Failed to initialize Frame SDK:", err);
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    };

    initializeSdk();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!state.isReady || !state.sdk?.wallet?.ethProvider) {
      return;
    }

    const ethProvider = state.sdk.wallet.ethProvider;
    if (!ethProvider) {
      return;
    }

    const win = window as Window;
    win.__nounspaceMiniAppEthProvider = ethProvider;

    const iconUrl = new URL(
      MINI_APP_PROVIDER_METADATA.iconPath,
      window.location.origin,
    ).toString();

    const providerInfo = {
      uuid: MINI_APP_PROVIDER_METADATA.uuid,
      name: MINI_APP_PROVIDER_METADATA.name,
      icon: iconUrl,
      rdns: MINI_APP_PROVIDER_METADATA.rdns,
    } as const;

    win.__nounspaceMiniAppProviderInfo = providerInfo;

    const announceProvider = () => {
      const detail = Object.freeze({
        info: Object.freeze({ ...providerInfo }),
        provider: ethProvider,
      });

      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail,
        }),
      );
    };

    window.dispatchEvent(new Event("ethereum#initialized"));
    announceProvider();

    const handleRequestProvider = () => {
      announceProvider();
    };

    window.addEventListener("eip6963:requestProvider", handleRequestProvider);

    // Forwarding EIP-6963 events between parent and iframe
    const isInIframe = window.parent !== window;

    // originId used to prevent message echo/loopback
    const originId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : `nounspace-miniapp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Determine allowed parent origin from document.referrer when available.
    // If referrer is not available fallback to '*'.
    let allowedParentOrigin: string = "*";
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        allowedParentOrigin = u.origin || "*";
      }
    } catch (err) {
      // ignore
    }

    // Receives from parent and dispatches locally
    const handleParentMessage = (event: MessageEvent) => {
      try {
        console.debug("MiniAppSdkProvider.handleParentMessage: got message", { origin: event.origin, data: event.data });
        // origin validation
        if (allowedParentOrigin !== "*" && event.origin !== allowedParentOrigin) return;
        if (!event.data || typeof event.data !== "object") return;

        // ignore messages that originated from this same instance
        if ((event.data as any).source && (event.data as any).source === originId) return;

        const { type, detail } = event.data as { type?: string; detail?: unknown };

        if (type === "eip6963:announceProvider") {
          // basic validation of payload shape
          if (!detail || typeof detail !== "object") return;
          console.debug("MiniAppSdkProvider.handleParentMessage: dispatching local announceProvider", { detail });
          window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail }));
        }

        if (type === "eip6963:requestProvider") {
          console.debug("MiniAppSdkProvider.handleParentMessage: dispatching local requestProvider");
          window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));
        }
      } catch (err) {
        // swallow any unexpected errors from foreign frames
      }
    };

    // Forwards local events to parent with originId to prevent loops
    const handleLocalAnnounce = (e: Event) => {
      if (isInIframe) {
        try {
          const detail = (e as CustomEvent).detail;
          window.parent.postMessage({ type: "eip6963:announceProvider", detail, source: originId }, allowedParentOrigin);
        } catch (err) {
          // ignore postMessage errors (non-cloneable objects etc.)
        }
      }
    };

    const handleLocalRequest = () => {
      if (isInIframe) {
        try {
          window.parent.postMessage({ type: "eip6963:requestProvider", source: originId }, allowedParentOrigin);
        } catch (err) {
          // ignore
        }
      }
    };

    if (isInIframe) {
      window.addEventListener("message", handleParentMessage);
      window.addEventListener("eip6963:announceProvider", handleLocalAnnounce);
      window.addEventListener("eip6963:requestProvider", handleLocalRequest);
    }

    // If we're the parent (hosting iframe), listen for rpc requests from child iframes
    const isParentContext = !isInIframe;

    const handleChildMessage = async (event: MessageEvent) => {
      try {
        console.debug("MiniAppSdkProvider.handleChildMessage: got message from child", { origin: event.origin, data: event.data });
        if (!event.data || typeof event.data !== "object") return;

        const { type, id, method, params } = event.data as any;

        // Basic origin validation could be added here if desired. We default to allowing '*'.

        if (type === "rpcRequest") {
          // event.source is the child window
          const target = event.source as Window | null;
          if (!target) return;

          try {
            console.debug("MiniAppSdkProvider.handleChildMessage: rpcRequest executing", { method, params });
            const result = await (ethProvider as any).request({ method, params });
            console.debug("MiniAppSdkProvider.handleChildMessage: rpcRequest result", { id, result });
            target.postMessage({ type: "rpcResponse", id, result }, event.origin || "*");
          } catch (err) {
            console.debug("MiniAppSdkProvider.handleChildMessage: rpcRequest error", String(err));
            target.postMessage({ type: "rpcResponse", id, error: String(err) }, event.origin || "*");
          }
        }

        if (type === "eip6963:requestProvider") {
          // reply with announce info (without sending provider object across origins)
          const target = event.source as Window | null;
          if (!target) return;
          const detail = { info: providerInfo } as any;
          try {
            console.debug("MiniAppSdkProvider.handleChildMessage: sending announce to child", { detail });
            target.postMessage({ type: "eip6963:announceProvider", detail }, event.origin || "*");
          } catch (err) {
            console.debug("MiniAppSdkProvider.handleChildMessage: failed to post announceProvider to child", err);
            // ignore
          }
        }
      } catch (err) {
        // swallow
      }
    };

    if (isParentContext) {
      window.addEventListener("message", handleChildMessage);
    }

    // trigger a proactive request so the host announces itself
    window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));

    return () => {
      if (win.__nounspaceMiniAppEthProvider === ethProvider) {
        delete win.__nounspaceMiniAppEthProvider;
      }

      if (win.__nounspaceMiniAppProviderInfo && win.__nounspaceMiniAppProviderInfo.uuid === providerInfo.uuid) {
        delete win.__nounspaceMiniAppProviderInfo;
      }

      window.removeEventListener("eip6963:requestProvider", handleRequestProvider);

      if (isInIframe) {
        window.removeEventListener("message", handleParentMessage);
        window.removeEventListener("eip6963:announceProvider", handleLocalAnnounce);
        window.removeEventListener("eip6963:requestProvider", handleLocalRequest);
      }

      if (isParentContext) {
        window.removeEventListener("message", handleChildMessage);
      }
    };
  }, [state.isReady, state.sdk]);

  return (
    <MiniAppSdkContext.Provider value={state}>
      {children}
    </MiniAppSdkContext.Provider>
  );
};

export default MiniAppSdkProvider;

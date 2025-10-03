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
  const [resolvedEthProvider, setResolvedEthProvider] = useState<unknown>();

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
    if (!state.isReady || !state.sdk?.wallet) {
      setResolvedEthProvider(undefined);
      return;
    }

    let cancelled = false;

    const resolveProvider = async () => {
      try {
        const provider =
          (await state.sdk.wallet.getEthereumProvider()) ??
          state.sdk.wallet.ethProvider;

        if (cancelled) {
          return;
        }

        setResolvedEthProvider(provider);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to resolve Mini App Ethereum provider:", error);
          setResolvedEthProvider(undefined);
        }
      }
    };

    resolveProvider();

    return () => {
      cancelled = true;
    };
  }, [state.isReady, state.sdk]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!state.isReady) {
      const win = window as Window;
      delete win.__nounspaceMiniAppEthProvider;
      delete win.__nounspaceMiniAppProviderInfo;
      return;
    }

    const provider = resolvedEthProvider ?? state.sdk?.wallet?.ethProvider;
    if (!provider) {
      const win = window as Window;
      delete win.__nounspaceMiniAppEthProvider;
      delete win.__nounspaceMiniAppProviderInfo;
      return;
    }

    const win = window as Window;
    win.__nounspaceMiniAppEthProvider = provider;

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
        provider,
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

    window.addEventListener(
      "eip6963:requestProvider",
      handleRequestProvider,
    );

    window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));

    return () => {
      if (win.__nounspaceMiniAppEthProvider === provider) {
        delete win.__nounspaceMiniAppEthProvider;
      }

      if (
        win.__nounspaceMiniAppProviderInfo &&
        win.__nounspaceMiniAppProviderInfo.uuid === providerInfo.uuid
      ) {
        delete win.__nounspaceMiniAppProviderInfo;
      }

      window.removeEventListener(
        "eip6963:requestProvider",
        handleRequestProvider,
      );
    };
  }, [resolvedEthProvider, state.isReady, state.sdk]);

  return (
    <MiniAppSdkContext.Provider value={state}>
      {children}
    </MiniAppSdkContext.Provider>
  );
};

export default MiniAppSdkProvider;

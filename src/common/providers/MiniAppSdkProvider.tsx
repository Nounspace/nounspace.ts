"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { sdk as frameSdk, Context } from "@farcaster/frame-sdk";
import MiniAppReady from "../components/utilities/MiniAppReady";

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
type MiniAppContextState = {
  isInitializing: boolean;
  isReady: boolean;
  error: Error | null;
  sdk: typeof frameSdk | null;
  frameContext: Context.FrameContext | null;
};

type MiniAppContextValue = MiniAppContextState & {
  setContextState: React.Dispatch<React.SetStateAction<MiniAppContextState>>;
};

const noop: React.Dispatch<React.SetStateAction<MiniAppContextState>> = () => {
  // no-op used for default context setter
};

export const MiniAppSdkContext = createContext<MiniAppContextValue>({
  isInitializing: true,
  isReady: false,
  error: null,
  sdk: null,
  frameContext: null,
  setContextState: noop,
});

export const MiniAppSdkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<MiniAppContextState>({
    isInitializing: true,
    isReady: false,
    error: null,
    sdk: null,
    frameContext: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState((prev) => ({
      ...prev,
      sdk: frameSdk,
    }));

    const initializeSdk = async () => {
      try {
        const initialFrameContext = await frameSdk.context;

        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          frameContext: initialFrameContext,
          error: null,
        }));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to initialize Frame SDK:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    };

    void initializeSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      setContextState: setState,
    }),
    [state],
  );

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

    window.addEventListener(
      "eip6963:requestProvider",
      handleRequestProvider,
    );

    window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));

    return () => {
      if (win.__nounspaceMiniAppEthProvider === ethProvider) {
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
  }, [state.isReady, state.sdk]);

  return (
    <MiniAppSdkContext.Provider value={contextValue}>
      <MiniAppReady />
      {children}
    </MiniAppSdkContext.Provider>
  );
};

export default MiniAppSdkProvider;

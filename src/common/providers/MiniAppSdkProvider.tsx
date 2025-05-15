"use client";

import React, { createContext, useEffect, useState } from "react";
import { sdk as frameSdk, Context } from "@farcaster/frame-sdk";

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

  return (
    <MiniAppSdkContext.Provider value={state}>
      {children}
    </MiniAppSdkContext.Provider>
  );
};

export default MiniAppSdkProvider;

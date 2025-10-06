"use client";

import { useContext, useEffect, useRef } from "react";
import { MiniAppSdkContext } from "../../providers/MiniAppSdkProvider";

const MiniAppReady = () => {
  const { sdk, isReady, setContextState } = useContext(MiniAppSdkContext);
  const hasLoggedErrorRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!sdk || isReady) {
      return;
    }

    let rafId: number | null = null;
    let cancelled = false;

    hasLoggedErrorRef.current = false;

    const attemptReady = () => {
      if (!sdk || cancelled) {
        return;
      }

      sdk.actions
        .ready()
        .then(() => {
          if (cancelled) {
            return;
          }

          setContextState((prev) => ({
            ...prev,
            isReady: true,
            isInitializing: false,
            error: null,
          }));
          hasLoggedErrorRef.current = false;
        })
        .catch((err) => {
          if (cancelled) {
            return;
          }

          if (!hasLoggedErrorRef.current) {
            console.error("Mini App ready handshake failed:", err);
            hasLoggedErrorRef.current = true;
          }

          setContextState((prev) => ({
            ...prev,
            error: err instanceof Error ? err : new Error(String(err)),
          }));

          rafId = window.requestAnimationFrame(attemptReady);
        });
    };

    rafId = window.requestAnimationFrame(attemptReady);

    return () => {
      cancelled = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [sdk, isReady, setContextState]);

  return null;
};

export default MiniAppReady;

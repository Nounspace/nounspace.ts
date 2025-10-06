"use client";

import { useEffect, useRef } from "react";
import { useMiniAppSdk } from "@/common/lib/hooks/useMiniAppSdk";

const MiniAppReady = () => {
  const { sdk } = useMiniAppSdk();
  const hasSignaledReady = useRef(false);

  useEffect(() => {
    if (!sdk || hasSignaledReady.current) {
      return;
    }

    let animationFrameId: number | null = null;
    let cancelled = false;

    const markComplete = () => {
      hasSignaledReady.current = true;
    };

    const attemptSignal = async () => {
      if (!sdk || cancelled || hasSignaledReady.current) {
        return;
      }

      try {
        const isMiniApp =
          typeof sdk.isInMiniApp === "function" ? await sdk.isInMiniApp() : true;

        if (!isMiniApp) {
          markComplete();
          return;
        }

        await sdk.actions.ready();
        markComplete();
      } catch (error) {
        console.error("Error signaling mini app ready:", error);
        scheduleAttempt();
      }
    };

    function scheduleAttempt() {
      if (cancelled || hasSignaledReady.current) {
        return;
      }

      if (typeof window === "undefined") {
        void attemptSignal();
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        void attemptSignal();
      });
    }

    scheduleAttempt();

    return () => {
      cancelled = true;
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sdk]);

  return null;
};

export default MiniAppReady;

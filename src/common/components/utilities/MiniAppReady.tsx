"use client";

import { useEffect, useRef } from "react";
import { useMiniAppSdk } from "@/common/lib/hooks/useMiniAppSdk";
import useMiniApp from "@/common/utils/useMiniApp";

const MiniAppReady = () => {
  const { sdk } = useMiniAppSdk();
  const { isInMiniApp } = useMiniApp();
  const hasSignaledReady = useRef(false);

  useEffect(() => {
    if (hasSignaledReady.current) {
      return;
    }

    if (!sdk || isInMiniApp !== true) {
      return;
    }

    let animationFrameId: number | null = null;
    let readyCompleted = false;

    hasSignaledReady.current = true;

    const signalReady = async () => {
      try {
        await sdk.actions.ready();
        readyCompleted = true;
      } catch (error) {
        console.error("Error signaling mini app ready:", error);
        hasSignaledReady.current = false;
      }
    };

    if (typeof window === "undefined") {
      signalReady();
    } else {
      animationFrameId = window.requestAnimationFrame(signalReady);
    }

    return () => {
      if (!readyCompleted) {
        hasSignaledReady.current = false;
      }
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sdk, isInMiniApp]);

  return null;
};

export default MiniAppReady;

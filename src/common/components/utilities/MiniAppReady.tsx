"use client";

import { useEffect, useRef } from "react";
import { useMiniAppSdk } from "@/common/lib/hooks/useMiniAppSdk";

const MAX_ATTEMPTS = 120;
const MAX_DURATION_MS = 10_000;
const FALLBACK_DELAY_MS = 1_500;

const MiniAppReady = () => {
  const { sdk } = useMiniAppSdk();
  const hasSignaledReady = useRef(false);
  const attemptCount = useRef(0);
  const startTime = useRef<number | null>(null);
  const fallbackAttempted = useRef(false);
  const lastLoggedError = useRef<string | null>(null);

  useEffect(() => {
    if (!sdk || hasSignaledReady.current) {
      return;
    }

    let animationFrameId: number | null = null;
    let cancelled = false;

    const markComplete = () => {
      hasSignaledReady.current = true;
    };

    const getTimestamp = () => {
      if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
      }

      return Date.now();
    };

    const attemptSignal = async () => {
      if (!sdk || cancelled || hasSignaledReady.current) {
        return;
      }

      if (startTime.current === null) {
        startTime.current = getTimestamp();
      }

      attemptCount.current += 1;

      const now = getTimestamp();
      const elapsed = now - startTime.current;
      const limitReached =
        attemptCount.current >= MAX_ATTEMPTS || elapsed >= MAX_DURATION_MS;

      let isMiniApp: boolean | null = null;
      if (typeof sdk.isInMiniApp === "function") {
        try {
          isMiniApp = await sdk.isInMiniApp();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (lastLoggedError.current !== message) {
            console.warn("Mini app readiness detection failed:", error);
            lastLoggedError.current = message;
          }
          isMiniApp = null;
        }
      }

      let shouldAttemptReady = true;
      let usedFallback = false;

      if (isMiniApp === false) {
        if (!fallbackAttempted.current) {
          if (elapsed >= FALLBACK_DELAY_MS || limitReached) {
            usedFallback = true;
          } else {
            shouldAttemptReady = false;
          }
        } else if (limitReached) {
          markComplete();
          return;
        } else {
          shouldAttemptReady = false;
        }
      }

      if (!shouldAttemptReady) {
        if (limitReached) {
          markComplete();
        } else {
          scheduleAttempt();
        }
        return;
      }

      if (usedFallback) {
        fallbackAttempted.current = true;
      }

      try {
        await sdk.actions.ready();
        markComplete();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (lastLoggedError.current !== message) {
          console.error("Error signaling mini app ready:", error);
          lastLoggedError.current = message;
        }

        if (limitReached) {
          markComplete();
          return;
        }

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

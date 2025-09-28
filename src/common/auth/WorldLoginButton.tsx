"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { toast } from "sonner";

import { Button } from "@/common/components/atoms/button";
import { useWorldMiniAppAuth } from "./useWorldMiniAppAuth";

type WorldLoginButtonProps = {
  className?: string;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onSuccess?: () => void;
};

export function WorldLoginButton({
  className,
  onError,
  onStart,
  onSuccess,
}: WorldLoginButtonProps) {
  const { signInWithWorld, isReadyForWorldLogin } = useWorldMiniAppAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsInstalled(false);
      return;
    }
    setIsInstalled(MiniKit.isInstalled());
  }, []);

  const buttonLabel = useMemo(() => {
    if (isSigningIn) {
      return "Connecting to World App...";
    }

    if (!isReadyForWorldLogin) {
      return "Preparing World App login...";
    }

    return "Continue with World App";
  }, [isReadyForWorldLogin, isSigningIn]);

  const handleSignIn = useCallback(async () => {
    try {
      if (!isReadyForWorldLogin) {
        throw new Error("World App login is still initializing. Please try again.");
      }

      setIsSigningIn(true);
      onStart?.();
      await signInWithWorld();
      toast.success("Signed in with World App");
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error(err.message);
      onError?.(err);
    } finally {
      setIsSigningIn(false);
    }
  }, [signInWithWorld, onError, onStart, onSuccess]);

  if (!isInstalled) {
    return null;
  }

  return (
    <Button
      className={className}
      variant="primary"
      color="primary"
      disabled={isSigningIn || !isReadyForWorldLogin}
      onClick={handleSignIn}
    >
      {buttonLabel}
    </Button>
  );
}

export default WorldLoginButton;

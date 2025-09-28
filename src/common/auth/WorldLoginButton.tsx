"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const { signInWithWorld } = useWorldMiniAppAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsInstalled(false);
      return;
    }
    setIsInstalled(MiniKit.isInstalled());
  }, []);

  const buttonLabel = useMemo(
    () => (isSigningIn ? "Connecting to World App..." : "Continue with World App"),
    [isSigningIn],
  );

  const handleSignIn = useCallback(async () => {
    try {
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
      disabled={isSigningIn}
      onClick={handleSignIn}
    >
      {buttonLabel}
    </Button>
  );
}

export default WorldLoginButton;

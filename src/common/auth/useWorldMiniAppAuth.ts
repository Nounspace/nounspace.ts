"use client";

import { useCallback } from "react";
import { MiniKit, type MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import { useLoginWithSiwe, usePrivy } from "@privy-io/react-auth";

export const WORLD_APP_SIWE_STATEMENT =
  "Sign in to Nounspace via World App (SIWE)";

export function useWorldMiniAppAuth() {
  const { loginWithSiwe } = useLoginWithSiwe();
  const { generateSiweNonce } = usePrivy();

  const signInWithWorld = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      throw new Error("World App MiniKit is not available in this environment.");
    }

    const nonce = await generateSiweNonce();

    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce,
      requestId: "0",
      statement: WORLD_APP_SIWE_STATEMENT,
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    if (!finalPayload) {
      throw new Error("World App did not return a valid response.");
    }

    const payload = finalPayload as MiniAppWalletAuthPayload;

    if (payload.status === "error") {
      const message =
        typeof payload.details === "string"
          ? payload.details
          : "World App authentication was rejected.";
      throw new Error(message);
    }

    const { message, signature } = payload;

    if (!message || !signature) {
      throw new Error("World App returned an incomplete SIWE payload.");
    }

    await loginWithSiwe({
      message,
      signature,
    });
  }, [generateSiweNonce, loginWithSiwe]);

  return { signInWithWorld };
}

export default useWorldMiniAppAuth;

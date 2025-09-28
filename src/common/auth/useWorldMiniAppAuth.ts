"use client";

import { useCallback } from "react";
import { MiniKit, type MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import { usePrivy, type PrivyClient } from "@privy-io/react-auth";

export const WORLD_APP_SIWE_STATEMENT =
  "Sign in to Nounspace via World App (SIWE)";

type SiweCapablePrivyClient = Pick<PrivyClient, never> & {
  generateSiweNonce: (params?: { address?: string; captchaToken?: string }) => Promise<string>;
  authenticateWithSiweInternal: (params: {
    message: string;
    signature: string;
    chainId?: string;
    walletClientType?: string | null;
    connectorType?: string | null;
    mode?: string;
  }) => Promise<unknown>;
};

function normalizeChainId(payload: MiniAppWalletAuthPayload): string | undefined {
  const rawChainIdInput =
    (payload as { chainId?: string | number | null }).chainId ?? null;
  const rawChainId =
    rawChainIdInput !== undefined && rawChainIdInput !== null
      ? String(rawChainIdInput)
      : undefined;

  if (rawChainId && rawChainId.trim().length > 0) {
    return rawChainId.startsWith("eip155:") ? rawChainId : `eip155:${rawChainId}`;
  }

  const message = (payload as { message?: string }).message;

  if (typeof message === "string") {
    const match = message.match(/Chain ID:\s*(\d+)/i);
    if (match?.[1]) {
      return `eip155:${match[1]}`;
    }
  }

  return undefined;
}

export function useWorldMiniAppAuth() {
  const privy = usePrivy() as unknown as { client?: SiweCapablePrivyClient };
  const client = privy.client;

  const signInWithWorld = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      throw new Error("World App MiniKit is not available in this environment.");
    }

    if (!client?.generateSiweNonce || !client.authenticateWithSiweInternal) {
      throw new Error("Privy SIWE helpers are unavailable in this environment.");
    }

    const nonce = await client.generateSiweNonce({});

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
      const errorMessage =
        typeof (payload as { details?: unknown }).details === "string"
          ? ((payload as { details?: unknown }).details as string)
          : "World App authentication was rejected.";
      throw new Error(errorMessage);
    }

    const { message, signature } = payload as {
      message?: string;
      signature?: string;
    };

    if (!message || !signature) {
      throw new Error("World App returned an incomplete SIWE payload.");
    }

    const chainId = normalizeChainId(payload);

    if (!chainId) {
      throw new Error("Unable to determine the chain ID from the World App response.");
    }

    await client.authenticateWithSiweInternal({
      message,
      signature,
      chainId,
      walletClientType: "world-app",
      connectorType: "world-app",
      mode: "login-or-sign-up",
    });
  }, [client]);

  return { signInWithWorld };
}

export default useWorldMiniAppAuth;

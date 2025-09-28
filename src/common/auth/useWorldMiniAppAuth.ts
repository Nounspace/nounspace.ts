"use client";

import { useCallback, useMemo } from "react";
import { MiniKit, type MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import {
  usePrivy,
  type PrivyClient,
  type PrivyInterface,
} from "@privy-io/react-auth";

export const WORLD_APP_SIWE_STATEMENT =
  "Sign in to Nounspace via World App (SIWE)";

type SiweCapablePrivyClient = Pick<PrivyClient, never> & {
  generateSiweNonce: (params?: {
    address?: string;
    captchaToken?: string;
  }) => Promise<string>;
  authenticateWithSiweInternal: (params: {
    message: string;
    signature: string;
    chainId?: string;
    walletClientType?: string | null;
    connectorType?: string | null;
    mode?: string;
  }) => Promise<unknown>;
};

const toOptionalChainId = (
  payload: MiniAppWalletAuthPayload,
): string | undefined => {
  const rawChainId = (payload as { chainId?: string | number | null }).chainId;

  if (rawChainId === undefined || rawChainId === null) {
    return undefined;
  }

  const trimmed = String(rawChainId).trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
};

const makeRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
};

export function useWorldMiniAppAuth() {
  const privy = usePrivy() as PrivyInterface & {
    client?: SiweCapablePrivyClient;
  };

  const { client, ready, getAccessToken } = privy;

  const signInWithWorld = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      throw new Error("World App MiniKit is not available in this environment.");
    }

    if (!ready) {
      throw new Error("World App login is unavailable until Privy is ready.");
    }

    if (!client?.generateSiweNonce || !client.authenticateWithSiweInternal) {
      throw new Error("Privy SIWE helpers are unavailable in this environment.");
    }

    const nonce = await client.generateSiweNonce({});

    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce,
      requestId: makeRequestId(),
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

    const chainId = toOptionalChainId(payload);

    await client.authenticateWithSiweInternal({
      message,
      signature,
      chainId,
      walletClientType: "world-app",
      connectorType: "world-app",
      mode: "login-or-sign-up",
    });

    await getAccessToken?.().catch(() => undefined);
  }, [client, getAccessToken, ready]);

  const isReadyForWorldLogin = useMemo(
    () => ready && !!client?.generateSiweNonce && !!client.authenticateWithSiweInternal,
    [client, ready],
  );

  return { signInWithWorld, isReadyForWorldLogin };
}

export default useWorldMiniAppAuth;

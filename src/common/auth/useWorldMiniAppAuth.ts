"use client";

import { useCallback, useMemo, useState } from "react";
import { MiniKit, type MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import {
  usePrivy,
  type PrivyClient,
  type PrivyInterface,
} from "@privy-io/react-auth";

// Define proper error types based on World App documentation
type WorldAppErrorPayload = {
  status: 'error';
  error_code: string;
  details?: string;
  version: number;
};

type WorldAppSuccessPayload = {
  status: 'success';
  message: string;
  signature: string;
  chainId?: string | number;
  version: number;
};

type WorldAppWalletAuthResponse = WorldAppErrorPayload | WorldAppSuccessPayload;

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

// Removed toOptionalChainId - now handling chainId directly from typed payload

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
  const [debugLogs, setDebugLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string; data?: any }>>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Initializing...');

  const addDebugLog = useCallback((level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    setDebugLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
  }, []);

  const updateStatus = useCallback((status: string) => {
    setCurrentStatus(status);
    addDebugLog('info', `Status: ${status}`);
  }, [addDebugLog]);

  // Initialize status and logging
  useMemo(() => {
    addDebugLog('info', 'World App auth hook initialized');
    updateStatus('Initializing...');
  }, [addDebugLog, updateStatus]);

  const signInWithWorld = useCallback(async () => {
    updateStatus("Starting authentication...");
    addDebugLog('info', 'World App authentication started');

    if (!MiniKit.isInstalled()) {
      addDebugLog('error', 'MiniKit not installed');
      throw new Error("World App is not installed. Please install World App to continue.");
    }

    addDebugLog('info', 'MiniKit is installed');

    if (!ready) {
      addDebugLog('warn', 'Privy not ready', { ready });
      throw new Error("Authentication system is still initializing. Please wait a moment and try again.");
    }

    addDebugLog('info', 'Privy is ready');

    if (!client?.generateSiweNonce || !client.authenticateWithSiweInternal) {
      addDebugLog('error', 'Missing Privy SIWE methods', { 
        hasGenerateSiweNonce: !!client?.generateSiweNonce,
        hasAuthenticateWithSiweInternal: !!client?.authenticateWithSiweInternal
      });
      throw new Error("Authentication services are temporarily unavailable. Please refresh the page and try again.");
    }

    addDebugLog('info', 'Privy SIWE methods available');

    let nonce;
    try {
      updateStatus("Generating authentication challenge...");
      nonce = await client.generateSiweNonce({});
      addDebugLog('info', 'Nonce generated successfully', { nonce: nonce?.substring(0, 10) + '...' });
    } catch (error) {
      addDebugLog('error', 'Failed to generate nonce', { error: error instanceof Error ? error.message : String(error) });
      throw new Error("Failed to generate authentication challenge. Please try again.");
    }

    let finalPayload;
    try {
      updateStatus("Connecting to World App...");
      const requestId = makeRequestId();
      addDebugLog('info', 'Initiating World App wallet auth', { 
        requestId,
        statement: WORLD_APP_SIWE_STATEMENT,
        nonceLength: nonce.length
      });
      
      const result = await MiniKit.commandsAsync.walletAuth({
        nonce,
        requestId,
        statement: WORLD_APP_SIWE_STATEMENT,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      finalPayload = result.finalPayload;
      addDebugLog('info', 'World App responded', { 
        hasPayload: !!finalPayload,
        resultKeys: Object.keys(result)
      });
    } catch (error) {
      addDebugLog('error', 'World App connection failed', { 
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          throw new Error("Connection to World App timed out. Please make sure World App is open and try again.");
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          throw new Error("Network error occurred. Please check your connection and try again.");
        } else if (error.message.includes('cancelled') || error.message.includes('user')) {
          throw new Error("Authentication was cancelled. Please try again when ready.");
        }
      }
      
      throw new Error("Failed to connect with World App. Please make sure World App is open and try again.");
    }

    if (!finalPayload) {
      addDebugLog('error', 'No payload received from World App');
      throw new Error("World App did not return a valid response. Please try again.");
    }

    // Cast to our properly typed response
    const payload = finalPayload as WorldAppWalletAuthResponse;
    addDebugLog('info', 'Processing World App payload', { 
      status: payload.status, 
      version: payload.version 
    });

    if (payload.status === "error") {
      const errorPayload = payload as WorldAppErrorPayload;
      addDebugLog('error', 'World App returned error', { 
        errorCode: errorPayload.error_code,
        details: errorPayload.details,
        version: errorPayload.version
      });
      
      // Handle specific error codes based on World App documentation
      let errorMessage = "Authentication failed. Please try again.";
      
      switch (errorPayload.error_code) {
        case 'user_cancelled':
          errorMessage = "Authentication was cancelled by user.";
          break;
        case 'network_error':
          errorMessage = "Network error occurred. Please check your connection and try again.";
          break;
        case 'timeout':
          errorMessage = "Authentication timed out. Please try again.";
          break;
        case 'invalid_request':
          errorMessage = "Invalid authentication request. Please refresh and try again.";
          break;
        case 'generic_error':
        default:
          errorMessage = errorPayload.details || "Authentication failed. Please try again.";
          break;
      }
      
      throw new Error(errorMessage);
    }

    // Handle success payload
    const successPayload = payload as WorldAppSuccessPayload;
    const { message, signature, chainId: rawChainId } = successPayload;

    if (!message || !signature) {
      addDebugLog('error', 'Incomplete success payload from World App', { 
        hasMessage: !!message, 
        hasSignature: !!signature,
        version: successPayload.version
      });
      throw new Error("World App returned incomplete authentication data. Please try again.");
    }

    addDebugLog('info', 'Valid payload received', { 
      messageLength: message.length, 
      signatureLength: signature.length,
      version: successPayload.version
    });

    // Handle chainId from the success payload
    const chainId = rawChainId ? String(rawChainId).trim() : undefined;
    addDebugLog('info', 'Chain ID extracted', { chainId });

    try {
      updateStatus("Authenticating with Privy...");
      await client.authenticateWithSiweInternal({
        message,
        signature,
        chainId,
        walletClientType: "world-app",
        connectorType: "world-app",
        mode: "login-or-sign-up",
      });
      addDebugLog('info', 'Privy authentication successful');
    } catch (error) {
      addDebugLog('error', 'Privy authentication failed', { error: error instanceof Error ? error.message : String(error) });
      throw new Error("Authentication failed. Please try again or contact support if the problem persists.");
    }

    try {
      updateStatus("Getting access token...");
      await getAccessToken?.().catch(() => undefined);
      addDebugLog('info', 'Access token retrieved');
    } catch (error) {
      addDebugLog('warn', 'Failed to get access token', { error: error instanceof Error ? error.message : String(error) });
    }

    updateStatus("Authentication complete!");
    addDebugLog('info', 'World App authentication completed successfully');
  }, [client, getAccessToken, ready, addDebugLog, updateStatus]);

  const isReadyForWorldLogin = useMemo(
    () => ready && !!client?.generateSiweNonce && !!client.authenticateWithSiweInternal,
    [client, ready],
  );

  // Update status when ready state changes
  useMemo(() => {
    if (isReadyForWorldLogin) {
      updateStatus('Ready for authentication');
    } else if (ready) {
      updateStatus('Waiting for authentication services...');
    } else {
      updateStatus('Initializing...');
    }
  }, [isReadyForWorldLogin, ready, updateStatus]);

  return { 
    signInWithWorld, 
    isReadyForWorldLogin, 
    currentStatus, 
    debugLogs, 
    addDebugLog, 
    updateStatus 
  };
}

export default useWorldMiniAppAuth;

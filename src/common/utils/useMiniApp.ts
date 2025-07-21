import { useState, useEffect } from 'react';

// Debug flag for mini app logging
const DEBUG_MINIAPP = process.env.NODE_ENV === 'development';

// Farcaster Mini App SDK import (with fallback for SSR)
let sdk: any = null;
if (typeof window !== 'undefined') {
  try {
    sdk = require('@farcaster/miniapp-sdk').sdk;
  } catch (error) {
    if (DEBUG_MINIAPP) {
      console.warn('Farcaster Mini App SDK not available:', error);
    }
  }
}

/**
 * Custom hook to detect if the app is running in a Farcaster Mini App context
 * 
 * @param timeoutMs - Optional timeout in milliseconds for context verification (default: 100)
 * @returns Object containing:
 *   - isInMiniApp: boolean | null (true = in mini app, false = not in mini app, null = checking)
 *   - isLoading: boolean (true while checking, false when done)
 *   - error: Error | null (any error that occurred during detection)
 */
export const useMiniApp = (timeoutMs: number = 100) => {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkMiniAppContext = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!sdk) {
          // SDK not available, assume not in mini app
          setIsInMiniApp(false);
          setIsLoading(false);
          if (DEBUG_MINIAPP) {
            console.log('🔍 Mini App SDK not available, assuming not in mini app');
          }
          return;
        }

        const isMiniApp = await sdk.isInMiniApp(timeoutMs);
        setIsInMiniApp(isMiniApp);
        setIsLoading(false);

        if (DEBUG_MINIAPP) {
          console.log('🔍 Mini App detection result:', {
            isMiniApp,
            timeoutMs,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error during mini app detection');
        setError(error);
        setIsInMiniApp(false); // Assume not in mini app if detection fails
        setIsLoading(false);

        if (DEBUG_MINIAPP) {
          console.warn('⚠️ Failed to detect Mini App context:', error);
        }
      }
    };

    checkMiniAppContext();
  }, [timeoutMs]);

  return {
    isInMiniApp,
    isLoading,
    error
  };
};

/**
 * Synchronous check for mini app context (returns cached result or null if not checked yet)
 * Useful for immediate checks without async operations
 */
export const isMiniAppSync = (): boolean | null => {
  if (typeof window === 'undefined') {
    return false; // SSR context
  }

  // Quick heuristic checks for mini app environment
  // These are faster but less reliable than the full SDK check
  const isInIframe = window.self !== window.top;
  const isReactNativeWebView = !!(window as any).ReactNativeWebView;
  const hasParentOrigin = window.location !== window.parent.location;

  // If clearly not in an embedded context, return false immediately
  if (!isInIframe && !isReactNativeWebView && !hasParentOrigin) {
    return false;
  }

  // If in embedded context but SDK not available, return null (unknown)
  if (!sdk) {
    return null;
  }

  // For embedded contexts, we need the full SDK check
  return null;
};

export default useMiniApp;

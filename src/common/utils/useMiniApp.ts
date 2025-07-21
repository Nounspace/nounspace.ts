import { useState, useEffect } from 'react';

// Debug flag for mini app logging
const DEBUG_MINIAPP = process.env.NODE_ENV === 'development';

/**
 * Custom hook to detect if the app is running in a Farcaster Mini App context
 * 
 * @returns Object containing:
 *   - isInMiniApp: boolean | null (true = in mini app, false = not in mini app, null = checking)
 *   - isLoading: boolean (true while checking, false when done)
 *   - error: Error | null (any error that occurred during detection)
 */
export const useMiniApp = () => {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkMiniAppContext = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Skip if running on server
        if (typeof window === 'undefined') {
          setIsInMiniApp(false);
          setIsLoading(false);
          return;
        }

        try {
          // Dynamic import of the SDK
          const { sdk } = await import('@farcaster/miniapp-sdk');
          
          if (!sdk) {
            setIsInMiniApp(false);
            setIsLoading(false);
            if (DEBUG_MINIAPP) {
              console.log('🔍 Mini App SDK not available, assuming not in mini app');
            }
            return;
          }

          // According to the SDK API, isInMiniApp() doesn't take timeout as parameter
          // The timeout is handled internally by the SDK
          const isMiniApp = await sdk.isInMiniApp();
          setIsInMiniApp(isMiniApp);
          setIsLoading(false);

          if (DEBUG_MINIAPP) {
            console.log('🔍 Mini App detection result:', {
              isMiniApp,
              timestamp: new Date().toISOString()
            });
          }
        } catch (sdkError) {
          // SDK not available or failed to load
          setIsInMiniApp(false);
          setIsLoading(false);
          if (DEBUG_MINIAPP) {
            console.log('🔍 Mini App SDK not available, assuming not in mini app:', sdkError);
          }
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
  }, []); // No dependencies needed since we removed timeoutMs parameter

  return {
    isInMiniApp,
    isLoading,
    error
  };
};

/**
 * Synchronous check for mini app context using heuristics
 * Useful for immediate checks without async operations
 * Note: This is less reliable than the full SDK check in useMiniApp hook
 */
export const isMiniAppSync = (): boolean | null => {
  if (typeof window === 'undefined') {
    return false; // SSR context
  }

  // Quick heuristic checks for mini app environment
  // These are faster but less reliable than the full SDK check
  const isInIframe = window.self !== window.top;
  const isReactNativeWebView = !!(window as any).ReactNativeWebView;
  
  // Check for Farcaster-specific indicators
  const userAgent = navigator.userAgent;
  const isFarcasterWebView = userAgent.includes('Farcaster') || userAgent.includes('farcaster');
  
  // If clearly not in an embedded context, return false immediately
  if (!isInIframe && !isReactNativeWebView && !isFarcasterWebView) {
    return false;
  }

  // If in embedded context, we should use the full SDK check
  // Return null to indicate that async detection is needed
  return null;
};

export default useMiniApp;

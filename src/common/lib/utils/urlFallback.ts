import { useState, useEffect } from 'react';

/**
 * Utility functions for handling URL fallbacks
 */

/**
 * Get fallback URL for nouns.com domains
 * @param originalUrl - The original URL that failed to load
 * @returns The fallback URL or null if no fallback is available
 */
export const getNounsFallbackUrl = (originalUrl: string): string | null => {
  if (originalUrl.includes('nouns.com')) {
    return originalUrl.replace(/nouns\.com/g, 'nouns.wtf');
  }
  return null;
};

/**
 * Hook for handling URL fallback logic
 * @param initialUrl - The initial URL to try
 * @returns An object with the current URL, error state, and retry function
 */
export const useUrlFallback = (initialUrl: string) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when initial URL changes
  useEffect(() => {
    setCurrentUrl(initialUrl);
    setHasTriedFallback(false);
    setError(null);
  }, [initialUrl]);

  const tryFallback = (errorMessage?: string) => {
    const fallbackUrl = getNounsFallbackUrl(currentUrl);
    if (fallbackUrl && !hasTriedFallback) {
      console.log(`Error loading ${currentUrl}, trying fallback: ${fallbackUrl}`);
      setHasTriedFallback(true);
      setCurrentUrl(fallbackUrl);
      setError(null);
      return true; // Fallback attempted
    } else {
      setError(errorMessage || 'Failed to load URL');
      return false; // No fallback available
    }
  };

  return {
    currentUrl,
    hasTriedFallback,
    error,
    tryFallback,
    isUsingFallback: hasTriedFallback && currentUrl !== initialUrl
  };
};

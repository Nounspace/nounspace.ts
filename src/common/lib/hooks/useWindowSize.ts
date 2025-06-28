import { useState, useEffect, useCallback } from "react";

export default function useWindowSize() {
  const hasWindow = typeof window !== "undefined";

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  // Initialize with null values to avoid hydration mismatch
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null,
  });

  // Set initial dimensions after component mounts (client-side only)
  const [isClient, setIsClient] = useState(false);

  const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleResize = useCallback(
    debounce(() => {
      setWindowDimensions(getWindowDimensions());
    }, 200),
    [],
  );

  useEffect(() => {
    // Set client flag and initial dimensions on mount
    setIsClient(true);
    setWindowDimensions(getWindowDimensions());
  }, []);

  useEffect(() => {
    if (hasWindow && isClient) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [hasWindow, handleResize, isClient]);

  return windowDimensions;
}

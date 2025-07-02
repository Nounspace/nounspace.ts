import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [width, setWidth] = useState<number | null>(
    typeof window !== "undefined" ? window.innerWidth : null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Using ResizeObserver is more efficient than window events
    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      }, 200) 
    );

    resizeObserver.observe(document.documentElement);

    setWidth(window.innerWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Memoize the result to avoid reference changes
  return useMemo(() => {
    return width !== null ? width < MOBILE_BREAKPOINT : false;
  }, [width]);
}

export default useIsMobile;

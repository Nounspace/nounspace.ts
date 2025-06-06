import { useEffect, useState } from 'react';
import useWindowSize from './useWindowSize';

// Mobile breakpoint (in pixels)
export const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(): boolean {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (width !== null) {
      setIsMobile(width < MOBILE_BREAKPOINT);
    }
  }, [width]);
  
  return isMobile;
}

export default useIsMobile;
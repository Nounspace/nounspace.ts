import { useEffect, useState, useMemo } from 'react';
import useWindowSize from './useWindowSize';

export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (width !== null) {
      setIsMobile(width < MOBILE_BREAKPOINT);
    }
  }, [width]);
  
  return useMemo(() => isMobile, [isMobile]);
}

export default useIsMobile;
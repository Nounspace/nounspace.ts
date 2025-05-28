import useWindowSize from './useWindowSize';
import { useSidebarContext } from '@/common/components/organisms/Sidebar';

// Mobile breakpoint (in pixels)
export const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(): boolean {
  const { width } = useWindowSize();
  const { mobilePreview } = useSidebarContext();
  return mobilePreview || (width ? width < MOBILE_BREAKPOINT : false);
}

export default useIsMobile;
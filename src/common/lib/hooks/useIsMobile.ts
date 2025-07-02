import useWindowSize from './useWindowSize';

export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const { width } = useWindowSize();
  return width !== null ? width < MOBILE_BREAKPOINT : false;
}

export default useIsMobile;
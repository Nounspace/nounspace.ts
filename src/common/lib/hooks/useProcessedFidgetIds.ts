import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { FidgetInstanceData } from '@/common/fidgets';
import { 
  processTabFidgetIds, 
  getValidFidgetIds, 
  getMediaFidgetIds, 
  getPinnedCastIds,
  prioritizeFeedFidgets 
} from '@/common/utils/layoutUtils';

/**
 * A hook that processes fidget IDs for different layout views
 * 
 * @param layoutFidgetIds - The raw fidget IDs from the layout configuration
 * @param fidgetInstanceDatums - The fidget instance data
 * @param isMobile - Whether the current view is mobile
 * @returns An object with processed fidget IDs for different purposes
 */
export function useProcessedFidgetIds(
  layoutFidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean,
) {
  const pathname = usePathname();
  const isHomebasePath = pathname?.startsWith('/homebase');
  const isHomePath = pathname?.startsWith('/home');
  const isSpecialPath = isHomebasePath || isHomePath;
  
  // Get valid fidget IDs (those that should appear in the layout)
  const validFidgetIds = useMemo(() => 
    getValidFidgetIds(layoutFidgetIds, fidgetInstanceDatums, isMobile),
  [layoutFidgetIds, fidgetInstanceDatums, isMobile]);
  
  // Process fidget IDs for tabs (potentially consolidating on mobile)
  const processedFidgetIds = useMemo(() => 
  processTabFidgetIds(layoutFidgetIds, fidgetInstanceDatums, isMobile),
  [layoutFidgetIds, fidgetInstanceDatums, isMobile]);
  
  // Get media fidget IDs (for consolidated media view)
  const mediaFidgetIds = useMemo(() => 
    getMediaFidgetIds(validFidgetIds, fidgetInstanceDatums),
  [validFidgetIds, fidgetInstanceDatums]);
  
  // Get pinned cast IDs (for consolidated pinned view)
  const pinnedCastIds = useMemo(() => 
    getPinnedCastIds(validFidgetIds, fidgetInstanceDatums),
  [validFidgetIds, fidgetInstanceDatums]);
  
  // Get ordered fidget IDs (with feed prioritized except on special paths)
  const orderedFidgetIds = useMemo(() => 
    prioritizeFeedFidgets(processedFidgetIds, fidgetInstanceDatums, isSpecialPath),
  [processedFidgetIds, fidgetInstanceDatums, isSpecialPath]);
  
  return useMemo(() => ({
    validFidgetIds,
    processedFidgetIds,
    mediaFidgetIds,
    pinnedCastIds,
    orderedFidgetIds,
    isSpecialPath
  }), [validFidgetIds, processedFidgetIds, mediaFidgetIds, pinnedCastIds, orderedFidgetIds, isSpecialPath]);
}

export default useProcessedFidgetIds;

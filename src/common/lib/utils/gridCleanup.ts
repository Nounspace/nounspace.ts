import { FidgetInstanceData } from '@/common/fidgets';
import { PlacedGridItem } from '@/fidgets/layout/Grid';
import logger from '@/common/lib/logger';

export function cleanupLayout(
  layout: PlacedGridItem[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  hasProfile: boolean,
  hasFeed: boolean
): { cleanedLayout: PlacedGridItem[]; removedFidgetIds: string[] } {
  const cols = hasFeed ? 6 : 12;
  const maxRows = hasProfile ? 8 : 10;
  const cleanedLayout: typeof layout = [];
  const removedFidgetIds: string[] = [];

  // Helper function to check if a position is valid (no overlaps)
  const isSpaceAvailable = (
    x: number,
    y: number,
    w: number,
    h: number,
    excludeId?: string
  ): boolean => {
    logger.debug(`\n[isSpaceAvailable] Checking position (${x},${y},${w},${h})`);
    for (const item of cleanedLayout) {
      if (item.i === excludeId) {
        logger.debug(`[isSpaceAvailable] Skipping self-check for ${item.i}`);
        continue;
      }
      
      logger.debug(`[isSpaceAvailable] Comparing with ${item.i} at (${item.x},${item.y},${item.w},${item.h})`);
      
      // Check if rectangles overlap
      const horizontalOverlap = !(x + w <= item.x || x >= item.x + item.w);
      const verticalOverlap = !(y + h <= item.y || y >= item.y + item.h);
      
      logger.debug(`[isSpaceAvailable] Horizontal overlap: ${horizontalOverlap}`);
      logger.debug(`[isSpaceAvailable] Vertical overlap: ${verticalOverlap}`);
      
      if (horizontalOverlap && verticalOverlap) {
        logger.debug(`[isSpaceAvailable] Found overlap between (${x},${y},${w},${h}) and (${item.x},${item.y},${item.w},${item.h})`);
        return false;
      }
    }
    logger.debug(`[isSpaceAvailable] Position (${x},${y},${w},${h}) is available`);
    return true;
  };

  // Process each fidget in the layout
  for (const item of layout) {
    logger.debug(`\n[cleanupLayout] Processing fidget ${item.i} at (${item.x}, ${item.y})`);
    
    // First check if current position is valid
    if (isSpaceAvailable(item.x, item.y, item.w, item.h, item.i)) {
      logger.debug(`[cleanupLayout] Keeping fidget ${item.i} at (${item.x}, ${item.y})`);
      cleanedLayout.push(item);
      continue;
    }

    // If current position is invalid, try to find a new position
    let found = false;
    for (let x = 0; x <= cols - item.w; x++) {
      for (let y = 0; y <= maxRows - item.h; y++) {
        if (isSpaceAvailable(x, y, item.w, item.h, item.i)) {
          logger.debug(`[cleanupLayout] Moving fidget ${item.i} from (${item.x}, ${item.y}) to (${x}, ${y})`);
          cleanedLayout.push({
            ...item,
            x,
            y,
          });
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // If no valid position found, mark for removal
    if (!found) {
      logger.debug(`[cleanupLayout] Removing fidget ${item.i} - no valid position found`);
      removedFidgetIds.push(item.i);
    }
  }

  return { cleanedLayout, removedFidgetIds };
} 
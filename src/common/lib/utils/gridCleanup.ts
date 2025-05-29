import { FidgetInstanceData } from '@/common/fidgets';
import { PlacedGridItem } from '@/fidgets/layout/Grid';

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
    if (process.env.NODE_ENV !== "production")
      console.log(`\n[isSpaceAvailable] Checking position (${x},${y},${w},${h})`);
    for (const item of cleanedLayout) {
      if (item.i === excludeId) {
        if (process.env.NODE_ENV !== "production")
          console.log(`[isSpaceAvailable] Skipping self-check for ${item.i}`);
        continue;
      }
      
      if (process.env.NODE_ENV !== "production")
        console.log(`[isSpaceAvailable] Comparing with ${item.i} at (${item.x},${item.y},${item.w},${item.h})`);
      
      // Check if rectangles overlap
      const horizontalOverlap = !(x + w <= item.x || x >= item.x + item.w);
      const verticalOverlap = !(y + h <= item.y || y >= item.y + item.h);
      
      if (process.env.NODE_ENV !== "production") {
        console.log(`[isSpaceAvailable] Horizontal overlap: ${horizontalOverlap}`);
        console.log(`[isSpaceAvailable] Vertical overlap: ${verticalOverlap}`);
      }
      
      if (horizontalOverlap && verticalOverlap) {
        if (process.env.NODE_ENV !== "production")
          console.log(`[isSpaceAvailable] Found overlap between (${x},${y},${w},${h}) and (${item.x},${item.y},${item.w},${item.h})`);
        return false;
      }
    }
    if (process.env.NODE_ENV !== "production")
      console.log(`[isSpaceAvailable] Position (${x},${y},${w},${h}) is available`);
    return true;
  };

  // Process each fidget in the layout
  for (const item of layout) {
    if (process.env.NODE_ENV !== "production")
      console.log(`\n[cleanupLayout] Processing fidget ${item.i} at (${item.x}, ${item.y})`);
    
    // First check if current position is valid
    if (isSpaceAvailable(item.x, item.y, item.w, item.h, item.i)) {
      if (process.env.NODE_ENV !== "production")
        console.log(`[cleanupLayout] Keeping fidget ${item.i} at (${item.x}, ${item.y})`);
      cleanedLayout.push(item);
      continue;
    }

    // If current position is invalid, try to find a new position
    let found = false;
    for (let x = 0; x <= cols - item.w; x++) {
      for (let y = 0; y <= maxRows - item.h; y++) {
        if (isSpaceAvailable(x, y, item.w, item.h, item.i)) {
          if (process.env.NODE_ENV !== "production")
            console.log(`[cleanupLayout] Moving fidget ${item.i} from (${item.x}, ${item.y}) to (${x}, ${y})`);
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
      if (process.env.NODE_ENV !== "production")
        console.log(`[cleanupLayout] Removing fidget ${item.i} - no valid position found`);
      removedFidgetIds.push(item.i);
    }
  }

  return { cleanedLayout, removedFidgetIds };
} 
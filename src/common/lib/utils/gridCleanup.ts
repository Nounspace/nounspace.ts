import { FidgetInstanceData } from '@/common/fidgets';
import { PlacedGridItem } from '@/fidgets/layout/Grid';

export function comprehensiveCleanup(
  layout: PlacedGridItem[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  hasProfile: boolean,
  hasFeed: boolean
): { 
  cleanedLayout: PlacedGridItem[]; 
  cleanedFidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  hasChanges: boolean;
} {
  let hasChanges = false;
  
  // Key migration map for settings
  const keyMap: Record<string, string> = {
    "fidget Shadow": "fidgetShadow",
    "font Color": "fontColor",
  };

  // Step 1: Remove orphaned layout items (layout items without corresponding data)
  const validLayout = layout.filter(item => fidgetInstanceDatums[item.i]);
  if (validLayout.length !== layout.length) {
    hasChanges = true;
  }

  // Step 2: Remove unused fidgets and migrate settings
  const layoutFidgetIds = new Set(validLayout.map(item => item.i));
  const cleanedFidgetInstanceDatums = { ...fidgetInstanceDatums };
  
  Object.keys(cleanedFidgetInstanceDatums).forEach(id => {
    if (!layoutFidgetIds.has(id)) {
      // Remove unused fidgets
      delete cleanedFidgetInstanceDatums[id];
      hasChanges = true;
    } else {
      // Migrate settings keys
      const settings = cleanedFidgetInstanceDatums[id].config?.settings as Record<string, unknown>;
      if (settings) {
        Object.entries(keyMap).forEach(([oldKey, newKey]) => {
          if (oldKey in settings) {
            settings[newKey] = settings[oldKey];
            delete settings[oldKey];
            hasChanges = true;
          }
        });
      }
    }
  });

  // Step 3: Handle overlapping fidgets
  const { cleanedLayout, removedFidgetIds } = resolveOverlaps(
    validLayout,
    cleanedFidgetInstanceDatums,
    hasProfile,
    hasFeed
  );

  // Remove data for fidgets that couldn't be repositioned
  if (removedFidgetIds.length > 0) {
    removedFidgetIds.forEach(id => delete cleanedFidgetInstanceDatums[id]);
    hasChanges = true;
  }

  // Check for layout position changes
  if (cleanedLayout.some((item, i) => validLayout[i] && (item.x !== validLayout[i].x || item.y !== validLayout[i].y))) {
    hasChanges = true;
  }

  return { cleanedLayout, cleanedFidgetInstanceDatums, hasChanges };
}

export function resolveOverlaps(
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
    for (const item of cleanedLayout) {
      if (item.i === excludeId) {
        continue;
      }
      
      // Check if rectangles overlap
      const horizontalOverlap = !(x + w <= item.x || x >= item.x + item.w);
      const verticalOverlap = !(y + h <= item.y || y >= item.y + item.h);
      
      if (horizontalOverlap && verticalOverlap) {
        return false;
      }
    }
    return true;
  };

  // Process each fidget in the layout
  for (const item of layout) {
    // First check if current position is valid
    if (isSpaceAvailable(item.x, item.y, item.w, item.h, item.i)) {
      cleanedLayout.push(item);
      continue;
    }

    // If current position is invalid, try to find a new position
    let found = false;
    for (let x = 0; x <= cols - item.w; x++) {
      for (let y = 0; y <= maxRows - item.h; y++) {
        if (isSpaceAvailable(x, y, item.w, item.h, item.i)) {
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
      removedFidgetIds.push(item.i);
    }
  }

  return { cleanedLayout, removedFidgetIds };
} 
export const cleanupLayout = comprehensiveCleanup;

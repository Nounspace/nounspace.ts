export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Determine whether two grid items intersect.
 * This is used to weed out items that occupy the same grid cells.
 */
function rectanglesOverlap(a: GridLayoutItem, b: GridLayoutItem): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function removeOverlappingGridItems(config: {
  layoutDetails?: { layoutConfig?: { layout: GridLayoutItem[] } };
  fidgetInstanceDatums?: Record<string, unknown>;
}): void {
  const layout = config.layoutDetails?.layoutConfig?.layout;
  if (!Array.isArray(layout)) return;

  const filtered: GridLayoutItem[] = [];
  const removedIds: string[] = [];
  const occupied = new Set<string>();

  for (const item of layout) {
    let hasOverlap = false;
    // Check each grid cell the item would occupy
    for (let x = item.x; x < item.x + item.w && !hasOverlap; x++) {
      for (let y = item.y; y < item.y + item.h && !hasOverlap; y++) {
        const key = `${x}-${y}`;
        if (occupied.has(key)) {
          hasOverlap = true;
        }
      }
    }

    if (hasOverlap) {
      removedIds.push(item.i);
    } else {
      for (let x = item.x; x < item.x + item.w; x++) {
        for (let y = item.y; y < item.y + item.h; y++) {
          occupied.add(`${x}-${y}`);
        }
      }
      filtered.push(item);
    }
  }

  if (removedIds.length > 0) {
    if (config.layoutDetails?.layoutConfig) {
      config.layoutDetails.layoutConfig.layout = filtered;
    }
    if (config.fidgetInstanceDatums) {
      for (const id of removedIds) {
        delete config.fidgetInstanceDatums[id];
      }
    }
  }
}

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectanglesOverlap(a: GridLayoutItem, b: GridLayoutItem): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Remove grid items that occupy the same grid cells as a previously
 * encountered item. The first item encountered "wins" and overlapping
 * items are pruned from both the layout array and fidget datums.
 */
export function removeOverlappingGridItems(config: {
  layoutDetails?: { layoutConfig?: { layout: GridLayoutItem[] } };
  fidgetInstanceDatums?: Record<string, unknown>;
}): void {
  const layout = config.layoutDetails?.layoutConfig?.layout;
  if (!Array.isArray(layout)) return;

  const occupied = new Set<string>();
  const filtered: GridLayoutItem[] = [];
  const removedIds: string[] = [];

  for (const item of layout) {
    let hasOverlap = false;
    for (let x = item.x; x < item.x + item.w && !hasOverlap; x++) {
      for (let y = item.y; y < item.y + item.h; y++) {
        const key = `${x}:${y}`;
        if (occupied.has(key)) {
          hasOverlap = true;
          break;
        }
      }
    }

    if (hasOverlap) {
      removedIds.push(item.i);
      continue;
    }

    for (let x = item.x; x < item.x + item.w; x++) {
      for (let y = item.y; y < item.y + item.h; y++) {
        occupied.add(`${x}:${y}`);
      }
    }
    filtered.push(item);
  }

  if (removedIds.length) {
    config.layoutDetails!.layoutConfig!.layout = filtered;
    if (config.fidgetInstanceDatums) {
      for (const id of removedIds) {
        delete config.fidgetInstanceDatums[id];
      }
    }
  }
}

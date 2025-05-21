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

export function removeOverlappingGridItems(config: {
  layoutDetails?: { layoutConfig?: { layout: GridLayoutItem[] } };
  fidgetInstanceDatums?: Record<string, unknown>;
}): void {
  const layout = config.layoutDetails?.layoutConfig?.layout;
  if (!Array.isArray(layout)) return;

  const filtered: GridLayoutItem[] = [];
  const removedIds: string[] = [];

  for (const item of layout) {
    const overlaps = filtered.some((existing) => rectanglesOverlap(item, existing));
    if (overlaps) {
      removedIds.push(item.i);
    } else {
      filtered.push(item);
    }
  }

  if (removedIds.length > 0) {
    if (config.layoutDetails && config.layoutDetails.layoutConfig) {
      config.layoutDetails.layoutConfig.layout = filtered;
    }
    if (config.fidgetInstanceDatums) {
      for (const id of removedIds) {
        delete config.fidgetInstanceDatums[id];
      }
    }
  }
}

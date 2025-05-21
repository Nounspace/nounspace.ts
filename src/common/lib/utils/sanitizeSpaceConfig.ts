import { cloneDeep } from "lodash";
import { SpaceConfig } from "@/app/(spaces)/Space";
import { LayoutFidgetConfig, LayoutFidgetDetails } from "@/common/fidgets";

export interface SanitizeResult {
  sanitized: SpaceConfig;
  hasChanges: boolean;
}

/**
 * Sanitize a SpaceConfig by removing invalid entries and fixing known issues.
 */
export function sanitizeSpaceConfig(config: SpaceConfig): SanitizeResult {
  let changed = false;
  const sanitized = cloneDeep(config);

  const layout = sanitized.layoutDetails?.layoutConfig?.layout as any[] | undefined;
  const instanceDatums = sanitized.fidgetInstanceDatums || {};

  if (layout) {
    const validIds = new Set<string>();

    sanitized.layoutDetails!.layoutConfig.layout = layout.filter((item) => {
      if (!instanceDatums[item.i]) {
        changed = true;
        return false;
      }
      validIds.add(item.i);
      return true;
    });

    Object.keys(instanceDatums).forEach((id) => {
      const datum = instanceDatums[id];
      if (!validIds.has(id)) {
        delete instanceDatums[id];
        changed = true;
        return;
      }
      if (!datum.id) {
        datum.id = id;
        changed = true;
      }
      if (!datum.fidgetType) {
        datum.fidgetType = id.split(":")[0];
        changed = true;
      }
      const settings = datum.config?.settings as Record<string, unknown>;
      if (settings && "fidget Shadow" in settings) {
        settings.fidgetShadow = settings["fidget Shadow"];
        delete settings["fidget Shadow"];
        changed = true;
      }
    });

    // Basic overlap resolution
    for (let i = 0; i < layout.length; i++) {
      const a = layout[i];
      for (let j = 0; j < i; j++) {
        const b = layout[j];
        if (rectsOverlap(a, b)) {
          a.y = b.y + b.h;
          changed = true;
        }
      }
    }
  }

  return { sanitized, hasChanges: changed };
}

interface RectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOverlap(a: RectLike, b: RectLike): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}


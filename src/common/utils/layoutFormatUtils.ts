import {
  FidgetInstanceData,
  LayoutFidgetConfig,
  LayoutFidgetDetails
} from "@/common/fidgets";
import { SpaceLayoutConfig } from "@/common/types/nounspace";

export const isNewLayoutFormat = (
  layoutDetails: SpaceLayoutConfig | LayoutFidgetDetails<LayoutFidgetConfig<any>>
): boolean => {
  return 'layouts' in layoutDetails;
};

/**
 * Gets the layout fidget type for a specific mode
 * @param layoutDetails Layout details
 * @param mode Desired mode
 * @returns Layout fidget type (grid, tabFullScreen, etc.)
 */
export const getLayoutFidgetForMode = (
  layoutDetails: SpaceLayoutConfig | LayoutFidgetDetails<LayoutFidgetConfig<any>>,
  mode: 'mobile' | 'desktop' = 'desktop'
): string => {
  if (isNewLayoutFormat(layoutDetails)) {
    const spaceLayout = layoutDetails as SpaceLayoutConfig;
    return spaceLayout.layouts[mode]?.layoutFidget || 'grid';
  } else {
    const oldLayout = layoutDetails as LayoutFidgetDetails<LayoutFidgetConfig<any>>;
    return oldLayout.layoutFidget || 'grid';
  }
};

/**
 * Gets the fidgets order for mobile from the Space layout configuration
 * @param layoutDetails Layout details
 * @param fidgetInstanceDatums Fidgets data
 * @returns Array of IDs in correct order for mobile
 */
export const getMobileFidgetOrder = (
  layoutDetails: SpaceLayoutConfig | LayoutFidgetDetails<LayoutFidgetConfig<any>>,
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): string[] => {
  // Check if it's the new format and has mobile layout defined
  if (isNewLayoutFormat(layoutDetails) && 
      (layoutDetails as SpaceLayoutConfig).layouts?.mobile?.layout) {
    return (layoutDetails as SpaceLayoutConfig).layouts?.mobile?.layout || [];
  }
  
  return Object.keys(fidgetInstanceDatums || {});
};

/**
 * Converts old layout format to new format with automatic mobile order migration
 * @param oldLayout Old layout format
 * @param fidgetInstanceDatums Fidgets data
 * @returns New layout format
 */
export const convertToNewLayoutFormat = (
  oldLayout: LayoutFidgetDetails<LayoutFidgetConfig<any>>,
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): SpaceLayoutConfig => {
  // Get mobile layout order using the centralized function
  const mobileLayout = Object.keys(fidgetInstanceDatums || {}).sort((a, b) => {
    const aOrder = fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
    const bOrder = fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
    return aOrder - bOrder;
  });
  
  return {
    layouts: {
      desktop: {
        layout: oldLayout.layoutConfig?.layout || [],
        layoutFidget: oldLayout.layoutFidget || 'grid'
      },
      mobile: {
        layout: mobileLayout,
        layoutFidget: 'tabFullScreen'
      }
    },
    defaultLayout: 'desktop'
  };
};

/**
 * Gets layoutConfig compatible with both formats
 * @param layoutDetails Layout details (new or old format)
 * @param mode Desired mode (mobile, desktop)
 * @returns Layout configuration equivalent to old format layoutConfig
 */
export const getLayoutConfig = (
  layoutDetails: SpaceLayoutConfig | LayoutFidgetDetails<LayoutFidgetConfig<any>>,
  mode: 'mobile' | 'desktop' = 'desktop'
): any => {
  if (isNewLayoutFormat(layoutDetails)) {
    const layouts = (layoutDetails as SpaceLayoutConfig).layouts;
    return {
      layout: layouts[mode]?.layout || layouts.desktop?.layout || [],
    };
  } else {
    return (layoutDetails as LayoutFidgetDetails<LayoutFidgetConfig<any>>).layoutConfig;
  }
};

/**
 * Converts new layout format to old format (compatibility)
 * @param newLayout New layout format (SpaceLayoutConfig)
 * @param mode Mode to extract layout from (default: desktop)
 * @returns Old layout format (LayoutFidgetDetails)
 */
export const convertToOldLayoutFormat = (
  newLayout: SpaceLayoutConfig,
  mode: 'mobile' | 'desktop' = 'desktop'
): LayoutFidgetDetails<LayoutFidgetConfig<any>> => {
  const modeLayout = newLayout.layouts[mode];
  return {
    layoutFidget: modeLayout?.layoutFidget || 'grid',
    layoutConfig: {
      layout: modeLayout?.layout || []
    }
  };
};

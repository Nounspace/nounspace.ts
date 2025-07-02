import { FidgetBundle, FidgetInstanceData } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
import { isMediaFidget } from "@/common/utils/layoutUtils";

/**
 * Gets the appropriate display name for a fidget based on settings and context
 * 
 * @param fidgetData The fidget instance data
 * @param isMobile Whether the display is on mobile
 * @param specialId Optional special ID for consolidated views
 * @param customTabNames Optional array of custom tab names
 * @param fidgetIds Optional array of fidget IDs for matching custom tab names
 * @param fidgetIdIndex Optional index of the current fidget in the fidgetIds array
 * @returns The appropriate display name
 */
export const getFidgetDisplayName = (
  fidgetData: FidgetInstanceData | null,
  isMobile: boolean = false,
  specialId?: string,
  customTabNames?: string[],
  fidgetIds?: string[],
  fidgetIdIndex?: number
): string => {
  // Handle special consolidated views
  if (specialId === 'consolidated-media') {
    return "Media";
  }
  
  if (specialId === 'consolidated-pinned') {
    return "Pinned";
  }
  
  if (!fidgetData) return 'Unknown';
  
  // Use custom tab name if available
  if (customTabNames && fidgetIds && typeof fidgetIdIndex === 'number' && fidgetIdIndex >= 0) {
    const customName = customTabNames[fidgetIdIndex];
    if (customName) return customName;
  }
  
  const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
  if (!fidgetModule) return fidgetData.fidgetType; 

  if (isMobile) {
    // First check for user-defined custom mobile display name
    if (fidgetData.config?.settings?.customMobileDisplayName) {
      return fidgetData.config.settings.customMobileDisplayName;
    }
    // Then use the developer-defined mobile fidget name if available
    if (fidgetModule.properties.mobileFidgetName) {
      return fidgetModule.properties.mobileFidgetName;
    }
  }
  
  return fidgetModule.properties.fidgetName;
};

/**
 * Filter fidget settings that shouldn't show mobile options
 */
export const shouldShowMobileSettings = (fidgetType: string): boolean => {
  return !isMediaFidget(fidgetType);
};

/**
 * Checks if a fidget is a pinned cast
 */
export const isPinnedCast = (
  fidgetId: string, 
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): boolean => {
  const fidgetData = fidgetInstanceDatums[fidgetId];
  return fidgetData?.fidgetType === 'cast';
};

/**
 * Creates a FidgetBundle object from a FidgetInstanceData
 */
export const createFidgetBundle = (
  fidgetData: FidgetInstanceData, 
  isEditable: boolean = false
): FidgetBundle | null => {
  if (!fidgetData) return null;

  const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
  if (!fidgetModule) return null;

  return {
    ...fidgetData,
    properties: fidgetModule.properties,
    config: { ...fidgetData.config, editable: isEditable },
  };
};

/**
 * Processes fidget IDs for display, potentially consolidating media fidgets on mobile
 * Now handles any layout format by extracting fidget IDs first
 */
export const processTabFidgetIds = (
  layout: any,
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean
): string[] => {
  const fidgetIds = extractFidgetIdsFromLayout(layout, fidgetInstanceDatums);
  
  if (!isMobile) {
    // On desktop, use all fidgets as is
    return fidgetIds.filter(id => {
      const fidgetData = fidgetInstanceDatums[id];
      return !!fidgetData;
    });
  }
  
   // For mobile, process and potentially consolidate media fidgets
  const validFidgets = fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    
    if (!fidgetData) return false;
    
    if (fidgetData.config?.settings?.showOnMobile === false) return false;
    
    const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
    if (!fidgetModule) return false;
    
    return true;
  });
  
  // Find positions of media fidgets and pinned casts in the original order
  const mediaFidgetPositions: { id: string; position: number }[] = [];
  const pinnedCastPositions: { id: string; position: number }[] = [];
  const result: string[] = [];
  
  validFidgets.forEach((id, index) => {
    const fidgetData = fidgetInstanceDatums[id];
    
    if (isPinnedCast(id, fidgetInstanceDatums)) {
      pinnedCastPositions.push({ id, position: index });
    } else if (isMediaFidget(fidgetData.fidgetType)) {
      mediaFidgetPositions.push({ id, position: index });
    } else {
      // Non-media, non-pinned fidgets keep their original position
      result[index] = id;
    }
  });
  
  // Handle pinned casts - consolidate if multiple, preserve position of first one
  if (pinnedCastPositions.length > 1) {
    const firstPinnedPosition = pinnedCastPositions[0].position;
    result[firstPinnedPosition] = 'consolidated-pinned';
  } else if (pinnedCastPositions.length === 1) {
    const pinnedPosition = pinnedCastPositions[0].position;
    result[pinnedPosition] = pinnedCastPositions[0].id;
  }
  
  // Handle media fidgets - always consolidate on mobile, preserve position of first one
  if (mediaFidgetPositions.length >= 1) {
    const firstMediaPosition = mediaFidgetPositions[0].position;
    result[firstMediaPosition] = 'consolidated-media';
  }
  
  // Filter out undefined values and return
  return result.filter(id => id !== undefined);
};

/**
 * Extracts fidget IDs from any layout format
 * Handles both simple string arrays and complex grid layout objects
 */
export const extractFidgetIdsFromLayout = (
  layout: any, 
  fidgetInstanceDatums?: { [key: string]: FidgetInstanceData }
): string[] => {
  // If layout is already an array of strings, use it directly
  if (Array.isArray(layout) && layout.every(item => typeof item === 'string')) {
    return layout;
  }
  
  // If layout is an array of objects (grid layout), extract the 'i' property
  if (Array.isArray(layout) && layout.every(item => typeof item === 'object' && item?.i)) {
    return layout.map(item => item.i);
  }
  
  // If layout is empty/null and we have fidgetInstanceDatums, use all available fidgets
  if ((!layout || (Array.isArray(layout) && layout.length === 0)) && fidgetInstanceDatums) {
    return Object.keys(fidgetInstanceDatums);
  }
  
  // If layout is something else, return empty array
  return [];
};

/**
 * Get the fidget IDs that should be displayed in their original form
 * Now handles any layout format by extracting fidget IDs first
 */
export const getValidFidgetIds = (
  layout: any,
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean
): string[] => {
  const fidgetIds = extractFidgetIdsFromLayout(layout, fidgetInstanceDatums);
  
  return fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    
    if (!fidgetData) return false;
    
    const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
    if (!fidgetModule) return false;
    
    if (isMobile) {
      if (fidgetData.config?.settings?.showOnMobile === false) return false;
    }
    
    return true;
  });
};

/**
 * Get all media fidget IDs in their original order
 */
export const getMediaFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): string[] => {
  return fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    return fidgetData && isMediaFidget(fidgetData.fidgetType);
  });
};

/**
 * Get all pinned cast fidget IDs
 */
export const getPinnedCastIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): string[] => {
  return fidgetIds.filter(id => isPinnedCast(id, fidgetInstanceDatums));
};

/**
 * Dummy functions for view-only TabFullScreen layout
 */
export const dummyFunctions = {
  setCurrentFidgetSettings: () => {},
  setSelectedFidgetID: () => {},
  removeFidget: () => {},
  minimizeFidget: () => {},
};
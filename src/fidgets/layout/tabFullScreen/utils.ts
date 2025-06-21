import { FidgetBundle, FidgetInstanceData } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";

/**
 * Checks if a fidget is a media-type fidget (text, gallery, video)
 */
export const isMediaFidget = (fidgetType: string): boolean => {
  return ['text', 'gallery', 'Video'].includes(fidgetType);
};

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
 */
export const processTabFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean
): string[] => {
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
  
  const mediaFidgetIds: string[] = [];
  const pinnedCastIds: string[] = [];
  const nonMediaFidgetIds: string[] = [];
  
  validFidgets.forEach(id => {
    const fidgetData = fidgetInstanceDatums[id];
    
    if (isPinnedCast(id, fidgetInstanceDatums)) {
      pinnedCastIds.push(id);
    } else if (isMediaFidget(fidgetData.fidgetType)) {
      mediaFidgetIds.push(id);
    } else {
      nonMediaFidgetIds.push(id);
    }
  });
  
  const consolidatedIds: string[] = [];
  
  // If we have multiple pinned casts, return them under a special id
  if (pinnedCastIds.length > 1) {
    consolidatedIds.push('consolidated-pinned');
  } else {
    consolidatedIds.push(...pinnedCastIds);
  }
  
  // If we have multiple media fidgets, add them under a special id
  if (mediaFidgetIds.length > 1) {
    consolidatedIds.push('consolidated-media');
  } else {
    consolidatedIds.push(...mediaFidgetIds);
  }
  
  return [...consolidatedIds, ...nonMediaFidgetIds];
};

/**
 * Get the fidget IDs that should be displayed in their original form
 */
export const getValidFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean
): string[] => {
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
 * Get all media fidget IDs
 */
export const getMediaFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
): string[] => {
  return fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    return isMediaFidget(fidgetData.fidgetType);
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
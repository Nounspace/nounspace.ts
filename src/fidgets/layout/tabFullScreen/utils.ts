import { FidgetBundle, FidgetInstanceData } from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";

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

export const dummyFunctions = {
  setCurrentFidgetSettings: () => {},
  setSelectedFidgetID: () => {},
  removeFidget: () => {},
  minimizeFidget: () => {},
};
/**
 * Layout utilities for processing and managing fidget layouts across different views
 */

import { FidgetInstanceData } from "@/common/fidgets";
import { TabItem } from "@/common/components/organisms/MobileNavbar";
import { CompleteFidgets } from "@/fidgets";

/**
 * Checks if a fidget is a media-type fidget (text, gallery, video)
 */
export const isMediaFidget = (fidgetType: string): boolean => {
  // treat different casing and additional fidgets as media types
  const type = fidgetType.toLowerCase();
  return ['text', 'gallery', 'video', 'image'].includes(type);
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


export const processTabFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isMobile: boolean
): string[] => {
  if (!isMobile) {
    return fidgetIds.filter(id => !!fidgetInstanceDatums[id]);
  }
  
  // For mobile, filter valid fidgets but maintain order
  const validFidgets = fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    if (!fidgetData) return false;
    if (fidgetData.config?.settings?.showOnMobile === false) return false;
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
  
  // Handle media fidgets - consolidate if multiple, preserve position of first one
  if (mediaFidgetPositions.length > 1) {
    const firstMediaPosition = mediaFidgetPositions[0].position;
    result[firstMediaPosition] = 'consolidated-media';
  } else if (mediaFidgetPositions.length === 1) {
    const mediaPosition = mediaFidgetPositions[0].position;
    result[mediaPosition] = mediaFidgetPositions[0].id;
  }
  
  // Filter out undefined values and return
  return result.filter(id => id !== undefined);
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
    
    // On mobile, check showOnMobile setting
    if (isMobile) {
      const showOnMobile = fidgetData.config?.settings?.showOnMobile;
      // If showOnMobile is explicitly false, hide the fidget
      if (showOnMobile === false) return false;
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
 * Converts processed fidget IDs to TabItems for MobileNavbar
 */
export const createTabItemsFromFidgetIds = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  tabNames?: string[]
): TabItem[] => {
  return fidgetIds.map((id, index) => {
    let label = "";
    let fidgetType = "";
    
    // Handle special consolidated tabs
    if (id === 'consolidated-media') {
      label = "Media";
    } else if (id === 'consolidated-pinned') {
      label = "Pinned";
    } else {
      const fidgetData = fidgetInstanceDatums?.[id];
      if (fidgetData) {
        // Safely get fidgetType with null check
        fidgetType = fidgetData.fidgetType || "";
        // All media fidgets share the generic 'Media' label
        if (isMediaFidget(fidgetType)) {
          label = "Media";
        } else {
          // If user provided custom display name, use it
          const customMobileDisplayName = fidgetData.config?.settings?.customMobileDisplayName;
          if (customMobileDisplayName && typeof customMobileDisplayName === 'string' && customMobileDisplayName.trim() !== '') {
            label = customMobileDisplayName.trim();
          } else if (CompleteFidgets?.[fidgetType]?.properties) {
            const props = CompleteFidgets[fidgetType].properties;
            label = props.mobileFidgetName || props.fidgetName || "";
          }
        }
      }
    }
    
    // Provide default non-empty label fallback if none is set
    if (!label || label.trim() === '') {
      // Try to use tabNames array if available
      if (tabNames && tabNames[index] && typeof tabNames[index] === 'string' && tabNames[index].trim() !== '') {
        label = tabNames[index].trim();
      } else {
        // Final fallback to ensure all tabs have valid labels
        label = `Tab ${index + 1}`;
      }
    }
    
    return {
      id,
      label: label.trim(), // Ensure no leading/trailing whitespace
      fidgetType
    };
  });
};

/**
 * Prioritizes feed fidgets by moving them to the beginning of the array
 */
export const prioritizeFeedFidgets = (
  fidgetIds: string[],
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData },
  isSpecialPath: boolean = false
): string[] => {
  // Don't reorder on special paths or if we have 1 or fewer fidgets
  if (isSpecialPath || !fidgetIds || fidgetIds.length <= 1) {
    return fidgetIds;
  }
  
  // Function to check if a fidget is a feed type
  const isFeedFidget = (fidgetId: string): boolean => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return false;
    
    return fidgetDatum.fidgetType === 'feed';
  };
  
  // Create a copy of the array to avoid mutating the original
  const reorderedIds = [...fidgetIds];
  
  // Sort the array to move feed fidgets to the beginning
  reorderedIds.sort((a, b) => {
    const aIsFeed = isFeedFidget(a);
    const bIsFeed = isFeedFidget(b);
    
    if (aIsFeed && !bIsFeed) return -1; // a is feed, b is not, so a comes first
    if (!aIsFeed && bIsFeed) return 1;  // b is feed, a is not, so b comes first
    return 0; // Keep original relative order if both are feeds or both are not feeds
  });
  
  return reorderedIds;
};

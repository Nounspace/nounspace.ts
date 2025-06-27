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
  return ['text', 'gallery', 'Video'].includes(fidgetType);
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
  return fidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    if (!fidgetData) return false;
    if (fidgetData.config?.settings?.showOnMobile === false) return false;
    return true;
  });
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
      // Get fidget data and set label and type
      const fidgetData = fidgetInstanceDatums?.[id];
      if (fidgetData) {
        // Safely get fidgetType with null check
        fidgetType = fidgetData.fidgetType || "";
        
        // If user has provided custom display name in settings, use it
        const customMobileDisplayName = fidgetData.config?.settings?.customMobileDisplayName;
        if (customMobileDisplayName && typeof customMobileDisplayName === 'string' && customMobileDisplayName.trim() !== '') {
          label = customMobileDisplayName.trim();
        } else if (fidgetData.fidgetType && CompleteFidgets?.[fidgetData.fidgetType]) {
          // Otherwise use module properties with null checks
          const fidgetModule = CompleteFidgets[fidgetData.fidgetType];
          if (fidgetModule?.properties) {
            label = fidgetModule.properties.mobileFidgetName || 
                    fidgetModule.properties.fidgetName || 
                    "";
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

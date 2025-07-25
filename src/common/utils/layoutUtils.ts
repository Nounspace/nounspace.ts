import { FidgetInstanceData } from "@/common/fidgets";


export const isMediaFidget = (fidgetType: string): boolean => {
  const type = fidgetType.toLowerCase();
  return ['text', 'gallery', 'video', 'image'].includes(type);
};

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
  isMobile: boolean,
  mobileLayoutOrder?: string[]
): string[] => {
  if (!isMobile) {
    return fidgetIds.filter(id => !!fidgetInstanceDatums[id]);
  }
  
  // Use mobile layout order if provided, otherwise fall back to original logic
  let sortedFidgetIds: string[];
  
  if (mobileLayoutOrder && mobileLayoutOrder.length > 0) {
    sortedFidgetIds = mobileLayoutOrder.filter(id => !!fidgetInstanceDatums[id]);
    
    const remainingFidgets = fidgetIds.filter(id => 
      !mobileLayoutOrder.includes(id) && !!fidgetInstanceDatums[id]
    );
    sortedFidgetIds = [...sortedFidgetIds, ...remainingFidgets];
  } else {
    sortedFidgetIds = fidgetIds.filter(id => !!fidgetInstanceDatums[id]);
  }
  
  // For mobile, filter valid fidgets but maintain order
  const validFidgets = sortedFidgetIds.filter(id => {
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
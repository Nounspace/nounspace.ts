import React, { useMemo } from "react";
import { TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { BsImage, BsImageFill, BsFillPinFill, BsPin } from "react-icons/bs";
import { MdGridView } from "react-icons/md";
import { CompleteFidgets } from "@/fidgets";

interface TabNavigationProps {
  processedFidgetIds: string[];
  selectedTab: string;
  fidgetInstanceDatums: { [key: string]: any };
  isMobile: boolean;
  tabNames?: string[];
}

/**
 * Component for rendering the navigation tabs at the bottom of the screen
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  processedFidgetIds = [],
  selectedTab,
  fidgetInstanceDatums,
  isMobile,
  tabNames,
}) => {
  // Safe check for processedFidgetIds to prevent "Cannot read properties of undefined (reading 'length')" error
  if (!processedFidgetIds || processedFidgetIds.length <= 1) return null;
  
  // Function to check if a fidget is a feed type
  const isFeedFidget = (fidgetId: string): boolean => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return false;
    
    return fidgetDatum.fidgetType === 'feed';
  };
  
  // Reorder tabs to prioritize feed fidgets
  const orderedFidgetIds = useMemo(() => {
    if (!processedFidgetIds || processedFidgetIds.length <= 1) return processedFidgetIds;
    
    // Create a copy of the array to avoid mutating the original
    const reorderedIds = [...processedFidgetIds];
    
    // Sort the array to move feed fidgets to the beginning
    reorderedIds.sort((a, b) => {
      const aIsFeed = isFeedFidget(a);
      const bIsFeed = isFeedFidget(b);
      
      if (aIsFeed && !bIsFeed) return -1; // a is feed, b is not, so a comes first
      if (!aIsFeed && bIsFeed) return 1;  // b is feed, a is not, so b comes first
      return 0; // Keep original relative order if both are feeds or both are not feeds
    });
    
    return reorderedIds;
  }, [processedFidgetIds, fidgetInstanceDatums]);

  // Function to get name for a tab
  const getFidgetName = (fidgetId: string) => {
    // Special case for consolidated media
    if (fidgetId === 'consolidated-media') {
      return "Media";
    }
    
    // Special case for consolidated pinned casts
    if (fidgetId === 'consolidated-pinned') {
      return "Pinned";
    }
    
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return "Unknown";
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule) return "Unknown";
    
    // Use custom tab name if available, otherwise use mobile name for mobile devices or fidget name
    const validFidgetIds = Object.keys(fidgetInstanceDatums);
    const tabIndex = validFidgetIds.indexOf(fidgetId);
    const customName = tabNames && tabNames[tabIndex];
    
    if (customName) return customName;
    
    // Use mobileFidgetName on mobile devices if available, otherwise use fidgetName
    if (isMobile && fidgetModule.properties.mobileFidgetName) {
      return fidgetModule.properties.mobileFidgetName;
    }
    
    return fidgetModule.properties.fidgetName;
  };

  // Function to get icon component for a fidget
  const getFidgetIcon = (fidgetId: string) => {
    // Special case for consolidated media
    if (fidgetId === 'consolidated-media') {
      return selectedTab === fidgetId ? 
        <BsImageFill className="text-xl" /> : 
        <BsImage className="text-xl" />;
    }

    // Special case for consolidated pinned casts
    if (fidgetId === 'consolidated-pinned') {
      return selectedTab === fidgetId ? 
        <BsFillPinFill size={22} /> : 
        <BsPin size={22} />;
    }
    
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return <MdGridView className="text-xl" />;  // Default icon
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule) return <MdGridView className="text-xl" />;  // Default icon

    // On mobile, use custom mobile icons if available
    if (isMobile) {
      const isSelected = selectedTab === fidgetId;
      if (isSelected && fidgetModule.properties.mobileIconSelected) {
        return fidgetModule.properties.mobileIconSelected;
      } else if (fidgetModule.properties.mobileIcon) {
        return fidgetModule.properties.mobileIcon;
      }
    }
    
    // Fallback to emoji icon
    return (
      <span 
        className={`text-lg ${selectedTab === fidgetId ? 'text-black fill-black' : 'text-red-500 fill-red-500'}`} 
        role="img" 
        aria-label={fidgetModule.properties.fidgetName}
      >
        {String.fromCodePoint(fidgetModule.properties.icon)}
      </span>
    );
  };

  return (
    <div className="relative w-full h-full">
      <TabsList className={`
        w-full h-full 
        overflow-x-auto
        gap-4
        flex whitespace-nowrap
        scrollbar-none
        ${orderedFidgetIds.length <= 4 ? 'justify-evenly' : 'justify-start'}
        rounded-none
      `}>
        {orderedFidgetIds.map((fidgetId) => {
          const fidgetName = getFidgetName(fidgetId);
          
          return (
            <TabsTrigger 
              key={fidgetId} 
              value={fidgetId}
              className={`
                flex flex-col items-center justify-center
                min-w-[72px] h-full py-2 px-0
                font-medium
                ${isMobile ? 'text-xs' : 'text-sm'}
                hover:bg-gray-50 transition-colors
                data-[state=active]:text-primary
                rounded-lg
              `}
            >
              {getFidgetIcon(fidgetId)}
              <span className="truncate max-w-[80px] line-clamp-1">{fidgetName}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      {/* Gradient overlay */}
      {orderedFidgetIds.length > 4 && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none opacity-90"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 1) 100%)'
          }}
        />
      )}
    </div>
  );
};

export default TabNavigation;
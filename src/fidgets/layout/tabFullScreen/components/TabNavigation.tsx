import React, { useMemo, useRef, useState, useEffect } from "react";
import { TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { BsImage, BsImageFill, BsFillPinFill, BsPin } from "react-icons/bs";
import { MdGridView } from "react-icons/md";
import { CompleteFidgets } from "@/fidgets";
import { getFidgetDisplayName } from "../utils";
import { usePathname } from "next/navigation";

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
  // Ref for the tab list container
  const tabsListRef = useRef<HTMLDivElement>(null);
  
  // Enhanced state to track scroll position and gradient opacities
  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
    leftGradientOpacity: 0,
    rightGradientOpacity: 1,
  });

  // Safe check for processedFidgetIds to prevent "Cannot read properties of undefined (reading 'length')" error
  if (!processedFidgetIds || processedFidgetIds.length <= 1) return null;
  
  // Function to check if a fidget is a feed type
  const isFeedFidget = (fidgetId: string): boolean => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return false;
    
    return fidgetDatum.fidgetType === 'feed';
  };
  
  const pathname = usePathname();
  const isHomebasePath = pathname?.startsWith('/homebase');
  const isHomePath = pathname?.startsWith('/home');

  // Reorder tabs to prioritize feed fidgets
  const orderedFidgetIds = useMemo(() => {
    if (!processedFidgetIds || processedFidgetIds.length <= 1) return processedFidgetIds;
    if (isHomebasePath || isHomePath) return processedFidgetIds;
    
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
  }, [processedFidgetIds, fidgetInstanceDatums, isHomebasePath, isHomePath]);

  // Enhanced scroll handler to calculate gradient opacities based on scroll position
  const handleScroll = () => {
    if (!tabsListRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
    
    // Calculate how far we are from the start/end as a percentage
    const maxScroll = scrollWidth - clientWidth;
    
    // Calculate transition thresholds (pixels where opacity goes from 0 to 1)
    const transitionThreshold = 50; // 50px for the transition
    
    // Calculate left gradient opacity (0 when at start, 1 when scrolled at least transitionThreshold)
    const leftGradientOpacity = Math.min(scrollLeft / transitionThreshold, 1);
    
    // Calculate right gradient opacity (1 when not at end, 0 when approaching end)
    const distanceFromEnd = maxScroll - scrollLeft;
    const rightGradientOpacity = Math.min(distanceFromEnd / transitionThreshold, 1);
    
    // Keep the binary flags for any logic that needs them
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = distanceFromEnd <= 10;
    
    setScrollState({ 
      isAtStart, 
      isAtEnd,
      leftGradientOpacity,
      rightGradientOpacity
    });
  };

  // Add scroll listener when component mounts
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      tabsList.addEventListener('scroll', handleScroll);
      // Initialize scroll state
      handleScroll();
    }
    
    return () => {
      if (tabsList) {
        tabsList.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Function to get name for a tab
  const getFidgetName = (fidgetId: string) => {
    // Handle special consolidated views
    if (fidgetId === 'consolidated-media' || fidgetId === 'consolidated-pinned') {
      return getFidgetDisplayName(null, isMobile, fidgetId);
    }
    
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return "Unknown";
    
    // Get valid fidget IDs and find index for custom tab name
    const validFidgetIds = Object.keys(fidgetInstanceDatums);
    const fidgetIdIndex = validFidgetIds.indexOf(fidgetId);
    
    // Use the centralized utility function to get the display name
    return getFidgetDisplayName(
      fidgetDatum,
      isMobile,
      undefined,
      tabNames,
      validFidgetIds,
      fidgetIdIndex
    );
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
    <div
      className="relative w-full h-full"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <TabsList 
        ref={tabsListRef}
        className={`
          w-full h-full 
          overflow-x-auto
          gap-4
          flex whitespace-nowrap
          scrollbar-none
          ${orderedFidgetIds.length <= 4 ? 'justify-evenly' : 'justify-start'}
          rounded-none
        `}
      >
        {orderedFidgetIds.map((fidgetId) => {
          const fidgetName = getFidgetName(fidgetId);
          
          return (
            <TabsTrigger
              key={fidgetId}
              value={fidgetId}
              onClick={(e) => e.stopPropagation()}
              className={`
                flex flex-col items-center justify-center
                min-w-[72px] h-full py-2 px-0
                font-medium
                ${isMobile ? 'text-xs' : 'text-sm'}
                data-[state=active]:text-primary
                data-[state=active]:bg-transparent
                data-[state=active]:shadow-none
                data-[state=inactive]:opacity-50
                transition-opacity duration-200
                rounded-lg
              `}
            >
              {getFidgetIcon(fidgetId)}
              <span className="truncate max-w-[80px] line-clamp-1">{fidgetName}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      {/* Left gradient overlay - with opacity directly tied to scroll position */}
      <div 
        className={`
          absolute left-0 top-0 bottom-0 w-12 
          pointer-events-none 
          transition-opacity duration-0
          ${orderedFidgetIds.length <= 4 ? 'hidden' : ''}
        `}
        style={{
          background: 'linear-gradient(270deg, transparent 0%, hsla(240, 4.8%, 95.9%, 0.9) 50%, hsla(240, 4.8%, 95.9%, 1) 100%)',
          opacity: scrollState.leftGradientOpacity
        }}
      />
      
      {/* Right gradient overlay - with opacity directly tied to scroll position */}
      <div 
        className={`
          absolute right-0 top-0 bottom-0 w-12 
          pointer-events-none 
          transition-opacity duration-0
          ${orderedFidgetIds.length <= 4 ? 'hidden' : ''}
        `}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsla(240, 4.8%, 95.9%, 0.9) 50%, hsla(240, 4.8%, 95.9%, 1) 100%)',
          opacity: scrollState.rightGradientOpacity
        }}
      />
    </div>
  );
};

export default TabNavigation;
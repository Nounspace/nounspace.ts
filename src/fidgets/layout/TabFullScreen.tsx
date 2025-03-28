import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { BsImage, BsImageFill } from "react-icons/bs";
import {
  FidgetBundle,
  FidgetConfig,
  LayoutFidget,
  LayoutFidgetConfig,
  LayoutFidgetProps
} from "@/common/fidgets";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { MOBILE_PADDING, TAB_HEIGHT } from "@/constants/layout";
import { useState } from "react";
import { MdGridView } from "react-icons/md";
import { CompleteFidgets } from "..";

export interface TabFullScreenConfig extends LayoutFidgetConfig<string[]> {
  layout: string[];
}

type TabFullScreenProps = LayoutFidgetProps<TabFullScreenConfig>;

/**
 * TabFullScreen Layout
 * 
 * This component provides a tabbed interface for displaying multiple fidgets,
 * with the ability to switch between them.
 * 
 * Key features:
 * - Tab navigation fixed at the bottom of the screen
 * - Responsive design with mobile-specific styles
 * - Animated transitions between fidgets
 * - Support for custom tab names
 * - Mobile-specific padding around fidgets for better display
 * - Media consolidation on mobile devices (combines text, image, video, and cast fidgets)
 */
const TabFullScreen: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
}) => {
  // Filter out any fidget IDs that don't exist in fidgetInstanceDatums
  // and filter out fidgets that should be hidden on mobile
  const isMobile = useIsMobile();
  
  // Create a structure to identify media fidgets for consolidation
  const isMediaFidget = (fidgetType: string): boolean => {
    return ['text', 'gallery', 'Video', 'cast'].includes(fidgetType);
  };
  
  // Pre-process fidgets for mobile - group media types if on mobile
  const processedFidgetIds = (() => {
    if (!isMobile) {
      // On desktop, use all fidgets as is
      return layoutConfig.layout.filter(id => {
        const fidgetData = fidgetInstanceDatums[id];
        return !!fidgetData;
      });
    }
    
    // For mobile, process and potentially consolidate media fidgets
    const mediaFidgetIds: string[] = [];
    const nonMediaFidgetIds: string[] = [];
    
    // First separate media and non-media fidgets
    layoutConfig.layout.forEach(id => {
      const fidgetData = fidgetInstanceDatums[id];
      if (!fidgetData) return;
      
      // Skip fidgets that should be hidden on mobile
      if (fidgetData.config.settings.showOnMobile === false) return;
      
      if (isMediaFidget(fidgetData.fidgetType)) {
        mediaFidgetIds.push(id);
      } else {
        nonMediaFidgetIds.push(id);
      }
    });
    
    // If we have multiple media fidgets, return them under a special id
    if (mediaFidgetIds.length > 1) {
      return ['consolidated-media', ...nonMediaFidgetIds];
    } else {
      // If we have 0 or 1 media fidget, no need to consolidate
      return [...mediaFidgetIds, ...nonMediaFidgetIds];
    }
  })();
  
  // Original valid fidget IDs (without consolidation)
  const validFidgetIds = layoutConfig.layout.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    if (!fidgetData) return false;
    
    // On mobile, check showOnMobile setting
    if (isMobile) {
      const showOnMobile = fidgetData.config.settings.showOnMobile;
      // If showOnMobile is explicitly false, hide the fidget
      if (showOnMobile === false) return false;
    }
    
    return true;
  });
  
  // Get all media fidgets to be consolidated
  const mediaFidgetIds = validFidgetIds.filter(id => {
    const fidgetData = fidgetInstanceDatums[id];
    return isMediaFidget(fidgetData.fidgetType);
  });
  
  // Initialize with the first valid fidget ID
  const [selectedTab, setSelectedTab] = useState(processedFidgetIds.length > 0 ? processedFidgetIds[0] : "");
  
  const saveFidgetConfig = (id: string) => (newConfig: FidgetConfig): Promise<void> => {
    return saveConfig({
      fidgetInstanceDatums: {
        ...fidgetInstanceDatums,
        [id]: {
          ...fidgetInstanceDatums[id],
          config: newConfig,
        },
      },
    });
  };

  // Dummy functions since this is view-only
  const dummySetCurrentFidgetSettings = () => {};
  const dummySetSelectedFidgetID = () => {};
  const dummyRemoveFidget = () => {};
  const dummyMinimizeFidget = () => {};

  // If no valid fidgets, show empty state
  if (processedFidgetIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium mb-2">No fidgets available</h3>
          <p className="text-sm text-gray-400">Add some fidgets to see them here</p>
        </div>
      </div>
    );
  }

  // If selected tab is no longer valid, select the first valid one
  if (!processedFidgetIds.includes(selectedTab)) {
    setSelectedTab(processedFidgetIds[0]);
  }

  // Function to get name for a tab
  const getFidgetName = (fidgetId: string) => {
    // Special case for consolidated media
    if (fidgetId === 'consolidated-media') {
      return "Media";
    }
    
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return "Unknown";
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule) return "Unknown";
    
    // Use custom tab name if available, otherwise use mobile name for mobile devices or fidget name
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

  // Render a consolidated media tab content with multiple fidgets
  const renderConsolidatedMediaContent = () => {
    if (mediaFidgetIds.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-4 h-full overflow-y-auto pb-16">
        {mediaFidgetIds.map((fidgetId) => {
          const fidgetDatum = fidgetInstanceDatums[fidgetId];
          if (!fidgetDatum) return null;
          
          const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
          if (!fidgetModule) return null;
          
          const bundle: FidgetBundle = {
            ...fidgetDatum,
            properties: fidgetModule.properties,
            config: { ...fidgetDatum.config, editable: false }, // Ensure fidgets are not editable
          };

          const aspectRatioClass = 
            fidgetModule.properties.fidgetName === "Image" ? 
            "aspect-[4/3] w-full overflow-hidden" : 
            "aspect-square w-full overflow-hidden";
          
          return (
            <div 
              key={fidgetId} 
              className={`${aspectRatioClass} relative rounded-lg`}
            >
              <div className="absolute inset-0">
                <FidgetWrapper
                  fidget={fidgetModule.fidget}
                  context={{ theme }}
                  bundle={bundle}
                  saveConfig={saveFidgetConfig(fidgetId)}
                  setCurrentFidgetSettings={dummySetCurrentFidgetSettings}
                  setSelectedFidgetID={dummySetSelectedFidgetID}
                  selectedFidgetID=""
                  removeFidget={dummyRemoveFidget}
                  minimizeFidget={dummyMinimizeFidget}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Main content area with padding-bottom to make space for fixed tabs */}
      <div 
        className="w-full h-full overflow-hidden" 
        style={{ 
          paddingBottom: processedFidgetIds.length > 1 ? `${TAB_HEIGHT}px` : '0',
        }}
      >
        <Tabs 
          value={selectedTab}
          className="w-full h-full"
          onValueChange={setSelectedTab}
        >
          <div className="relative z-40 h-full">
            {/* Special case for consolidated media tab */}
            {isMobile && mediaFidgetIds.length > 1 && (
              <TabsContent 
                key="consolidated-media" 
                value="consolidated-media"
                className="h-full w-full block"
                style={{ visibility: 'visible', display: 'block' }}
              >
                <div
                  className="h-full w-full"
                  style={{ 
                    paddingInline: `${MOBILE_PADDING}px`, paddingTop: `${MOBILE_PADDING - 16}px`,
                  }}
                >
                  {renderConsolidatedMediaContent()}
                </div>
              </TabsContent>
            )}
            
            {/* Regular non-consolidated tabs */}
            {processedFidgetIds
              .filter(id => id !== 'consolidated-media')
              .map((fidgetId) => {
                const fidgetDatum = fidgetInstanceDatums[fidgetId];
                if (!fidgetDatum) return null;
                
                const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
                if (!fidgetModule) return null;
                
                const bundle: FidgetBundle = {
                  ...fidgetDatum,
                  properties: fidgetModule.properties,
                  config: { ...fidgetDatum.config, editable: false }, // Ensure fidgets are not editable
                };
                
                // Only render the content for the selected tab
                return (
                  <TabsContent 
                    key={fidgetId} 
                    value={fidgetId}
                    className="h-full w-full block"
                    style={{ visibility: 'visible', display: 'block' }}
                  >
                    <div
                      className="h-full w-full"
                      style={isMobile ? { 
                        paddingInline: `${MOBILE_PADDING}px`, paddingTop: `${MOBILE_PADDING - 16}px`,
                      } : {}}
                    >
                      <FidgetWrapper
                        fidget={fidgetModule.fidget}
                        context={{ theme }}
                        bundle={bundle}
                        saveConfig={saveFidgetConfig(fidgetId)}
                        setCurrentFidgetSettings={dummySetCurrentFidgetSettings}
                        setSelectedFidgetID={dummySetSelectedFidgetID}
                        selectedFidgetID=""
                        removeFidget={dummyRemoveFidget}
                        minimizeFidget={dummyMinimizeFidget}
                      />
                    </div>
                  </TabsContent>
                );
            })}
          </div>
          
          {/* Tabs fixed to bottom of screen */}
          {processedFidgetIds.length > 1 && (
            <div 
              className="fixed bottom-0 left-0 right-0 z-50 bg-white"
              style={{ height: `${TAB_HEIGHT}px` }}
            >
              <TabsList className={`
                w-full h-full 
                overflow-x-auto
                gap-4
                flex whitespace-nowrap
                scrollbar-none
                ${processedFidgetIds.length <= 4 ? 'justify-evenly' : 'justify-start'}
                rounded-none
              `}>
                {processedFidgetIds.map((fidgetId) => {
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
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default TabFullScreen;
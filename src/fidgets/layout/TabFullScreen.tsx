import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import {
  FidgetBundle,
  FidgetConfig,
  LayoutFidget,
  LayoutFidgetConfig,
  LayoutFidgetProps
} from "@/common/fidgets";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import { MOBILE_PADDING, TAB_HEIGHT } from "@/constants/layout";
import React, { useState } from "react";
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
 */
const TabFullScreen: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
}) => {
  // Filter out any fidget IDs that don't exist in fidgetInstanceDatums
  const validFidgetIds = layoutConfig.layout.filter(id => fidgetInstanceDatums[id]);
  
  // Initialize with the first valid fidget ID
  const [selectedTab, setSelectedTab] = useState(validFidgetIds.length > 0 ? validFidgetIds[0] : "");
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;

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
  if (validFidgetIds.length === 0) {
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
  if (!validFidgetIds.includes(selectedTab)) {
    setSelectedTab(validFidgetIds[0]);
  }

  // Debug log to see which tab is selected
  console.log('Selected tab:', selectedTab, 'Valid tabs:', validFidgetIds);

  const getFidgetName = (fidgetId: string) => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return "Unknown";
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule) return "Unknown";
    
    // Use custom tab name if available, otherwise use mobile name for mobile devices or fidget name
    const customName = tabNames && tabNames[validFidgetIds.indexOf(fidgetId)];
    
    if (customName) return customName;
    
    // Use mobileFidgetName on mobile devices if available, otherwise use fidgetName
    if (isMobile && fidgetModule.properties.mobileFidgetName) {
      return fidgetModule.properties.mobileFidgetName;
    }
    
    return fidgetModule.properties.fidgetName;
  };

  // Function to get icon component for a fidget
  const getFidgetIcon = (fidgetId: string) => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return <MdGridView className="text-xl" />;  // Default icon
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule || !fidgetModule.properties.icon) return <MdGridView className="text-xl" />;  // Default icon
    
    // Return the emoji icon from the fidget properties
    return (
      <span className="text-lg" role="img" aria-label={fidgetModule.properties.fidgetName}>
        {String.fromCodePoint(fidgetModule.properties.icon)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Main content area with padding-bottom to make space for fixed tabs */}
      <div 
        className="w-full h-full overflow-hidden" 
        style={{ 
          paddingBottom: validFidgetIds.length > 1 ? `${TAB_HEIGHT}px` : '0',
        }}
      >
        <Tabs 
          value={selectedTab}
          className="w-full h-full"
          onValueChange={setSelectedTab}
        >
          <div className="relative z-40 h-full">
            {validFidgetIds.map((fidgetId) => {
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
          {validFidgetIds.length > 1 && (
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
                ${validFidgetIds.length === 4 ? 'justify-evenly' : 'justify-start'}
                rounded-none
              `}>
                {validFidgetIds.map((fidgetId) => {
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
import React, { useState } from "react";
import {
  LayoutFidget,
  LayoutFidgetProps,
  LayoutFidgetConfig,
  FidgetBundle,
  FidgetConfig,
  FidgetSettings,
  FidgetData,
} from "@/common/fidgets";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { CompleteFidgets } from "..";
import { map } from "lodash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/atoms/tabs";
import { motion, AnimatePresence } from "framer-motion";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

// TabFullScreen layout configuration
export interface TabFullScreenConfig extends LayoutFidgetConfig<string[]> {
  layout: string[]; // Array of fidget IDs in the order they should appear in tabs
}

type TabFullScreenProps = LayoutFidgetProps<TabFullScreenConfig>;

/**
 * TabFullScreen Layout
 * 
 * This component provides a tabbed interface for displaying multiple fidgets,
 * with the ability to switch between them.
 * 
 * Key features:
 * - Tab navigation at the top to switch between fidgets
 * - Responsive design with mobile-specific styles
 * - Animated transitions between fidgets
 * - Support for custom tab names
 */
const TabFullScreen: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
}) => {
  const [selectedTab, setSelectedTab] = useState(layoutConfig.layout[0] || "");
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

  // Filter out any fidget IDs that don't exist in fidgetInstanceDatums
  const validFidgetIds = layoutConfig.layout.filter(id => fidgetInstanceDatums[id]);

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

  const getFidgetName = (fidgetId: string) => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return "Unknown";
    
    const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
    if (!fidgetModule) return "Unknown";
    
    // Use custom tab name if available, otherwise use fidget name
    const customName = tabNames && tabNames[validFidgetIds.indexOf(fidgetId)];
    return customName || fidgetModule.properties.fidgetName;
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs 
        defaultValue={selectedTab} 
        className="w-full h-full flex flex-col"
        onValueChange={setSelectedTab}
      >
        {/* Adding z-index and background to make tabs visible above background */}
        <div className="relative z-50 bg-white bg-opacity-90 shadow-md rounded-t-lg">
          <TabsList className={`mb-2 ${isMobile ? 'overflow-x-auto flex-wrap justify-start p-1' : ''}`}>
            {map(validFidgetIds, (fidgetId) => {
              return (
                <TabsTrigger 
                  key={fidgetId} 
                  value={fidgetId}
                  className={`
                    px-4 py-2 font-medium
                    ${isMobile ? 'text-sm whitespace-nowrap' : ''}
                  `}
                >
                  {getFidgetName(fidgetId)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden relative z-40">
          <AnimatePresence mode="wait">
            {map(validFidgetIds, (fidgetId) => {
              const fidgetDatum = fidgetInstanceDatums[fidgetId];
              if (!fidgetDatum) return null;
              
              const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
              if (!fidgetModule) return null;
              
              const bundle: FidgetBundle = {
                ...fidgetDatum,
                properties: fidgetModule.properties,
                config: { ...fidgetDatum.config, editable: false }, // Ensure fidgets are not editable
              };
              
              return (
                <TabsContent 
                  key={fidgetId} 
                  value={fidgetId}
                  className="flex-1 h-full w-full"
                >
                  <motion.div
                    key={fidgetId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full"
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
                  </motion.div>
                </TabsContent>
              );
            })}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
};

export default TabFullScreen; 
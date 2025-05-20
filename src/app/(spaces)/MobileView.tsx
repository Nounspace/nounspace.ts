import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent } from "@/common/components/atoms/tabs";
import { MOBILE_PADDING } from "@/constants/layout";
import { FidgetConfig, FidgetBundle, FidgetInstanceData } from "@/common/fidgets";
import { UserTheme } from "@/common/lib/theme";
import { createFidgetBundle } from "@/fidgets/layout/tabFullScreen/utils";
import { CompleteFidgets } from "@/fidgets";
import MobileNavbar from "@/common/components/organisms/MobileNavbar";
import { createTabItemsFromFidgetIds } from "@/common/utils/layoutUtils";
import useProcessedFidgetIds from "@/common/hooks/useProcessedFidgetIds";

// Import the content components
import ConsolidatedMediaContent from "@/fidgets/layout/tabFullScreen/components/ConsolidatedMediaContent";
import ConsolidatedPinnedContent from "@/fidgets/layout/tabFullScreen/components/ConsolidatedPinnedContent";
import FidgetContent from "@/fidgets/layout/tabFullScreen/components/FidgetContent";

type MobileViewProps = {
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  layoutFidgetIds: string[];
  theme: UserTheme;
  saveConfig: (config: any) => Promise<void>;
  tabNames?: string[];
};

/**
 * MobileView component that handles the mobile-specific layout for Space
 * Provides a tabbed interface for displaying fidgets on mobile devices
 */
const MobileView: React.FC<MobileViewProps> = ({
  fidgetInstanceDatums,
  layoutFidgetIds,
  theme,
  saveConfig,
  tabNames,
}) => {
  const isMobile = true; // This component is always for mobile
  
  // Use the unified hook to process fidget IDs
  const {
    validFidgetIds,
    processedFidgetIds,
    mediaFidgetIds,
    pinnedCastIds,
    orderedFidgetIds
  } = useProcessedFidgetIds(layoutFidgetIds, fidgetInstanceDatums, isMobile);
  
  // Create tab items for the MobileNavbar
  const tabItems = useMemo(() => 
    createTabItemsFromFidgetIds(orderedFidgetIds, fidgetInstanceDatums, tabNames),
  [orderedFidgetIds, fidgetInstanceDatums, tabNames]);
  
  // Initialize with the first fidget ID
  const [selectedTab, setSelectedTab] = useState(
    orderedFidgetIds.length > 0 ? orderedFidgetIds[0] : ""
  );
  
  // Update selected tab when orderedFidgetIds changes
  useEffect(() => {
    // If there are no fidget IDs, do nothing
    if (orderedFidgetIds.length === 0) return;
    
    // If current selection is invalid or no tab is selected, select the first one
    if (!orderedFidgetIds.includes(selectedTab) && orderedFidgetIds.length > 0) {
      setSelectedTab(orderedFidgetIds[0]);
    } else if (orderedFidgetIds.length === 0) {
      setSelectedTab(""); // Clear selection if no tabs
    }
  }, [orderedFidgetIds, selectedTab]);
  
  // Create bundles for all fidgets
  const fidgetBundles = useMemo(() => {
    const bundles: Record<string, FidgetBundle> = {};
    
    validFidgetIds.forEach(id => {
      const fidgetData = fidgetInstanceDatums[id];
      if (!fidgetData) return;
      
      const bundle = createFidgetBundle(fidgetData, false);
      if (bundle) {
        bundles[id] = bundle;
      }
    });
    
    return bundles;
  }, [validFidgetIds, fidgetInstanceDatums]);
  
  // Configuration saving function
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

  // Conditional rendering after all hooks have been called
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
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Main content area */}
      <div className="w-full h-full overflow-hidden">
        <Tabs 
          value={selectedTab}
          className="w-full h-full"
          onValueChange={setSelectedTab}
        >
          <div className="relative z-40 h-full">
            {/* Special case for consolidated media tab */}
            {mediaFidgetIds.length > 1 && (
              <TabsContent 
                key="consolidated-media" 
                value="consolidated-media"
                className="h-full w-full block"
                style={{ visibility: 'visible', display: 'block' }}
              >
                <div
                  className="h-full w-full"
                  style={{ 
                    paddingInline: `${MOBILE_PADDING}px`, 
                    paddingTop: `${MOBILE_PADDING - 16}px`,
                  }}
                >
                  <ConsolidatedMediaContent 
                    mediaFidgetIds={mediaFidgetIds}
                    fidgetBundles={fidgetBundles}
                    theme={theme}
                    saveFidgetConfig={saveFidgetConfig}
                  />
                </div>
              </TabsContent>
            )}

            {/* Special case for consolidated pinned tab */}
            {pinnedCastIds.length > 1 && (
              <TabsContent 
                key="consolidated-pinned" 
                value="consolidated-pinned"
                className="h-full w-full block"
                style={{ visibility: 'visible', display: 'block' }}
              >
                <div
                  className="h-full w-full"
                  style={{ 
                    paddingInline: `${MOBILE_PADDING}px`, 
                    paddingTop: `${MOBILE_PADDING - 16}px`,
                  }}
                >
                  <ConsolidatedPinnedContent 
                    pinnedCastIds={pinnedCastIds}
                    fidgetBundles={fidgetBundles}
                    theme={theme}
                    saveFidgetConfig={saveFidgetConfig}
                  />
                </div>
              </TabsContent>
            )}
            
            {/* Regular non-consolidated tabs */}
            {processedFidgetIds
              .filter(id => id !== 'consolidated-media' && id !== 'consolidated-pinned')
              .map((fidgetId) => {
                const fidgetDatum = fidgetInstanceDatums[fidgetId];
                if (!fidgetDatum) return null;
                
                const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
                if (!fidgetModule) return null;
                
                const bundle = fidgetBundles[fidgetId] || createFidgetBundle(fidgetDatum, false);
                if (!bundle) return null;
                
                return (
                  <TabsContent 
                    key={fidgetId} 
                    value={fidgetId}
                    className="h-full w-full block"
                    style={{ visibility: 'visible', display: 'block' }}
                  >
                    <FidgetContent
                      fidgetId={fidgetId}
                      fidgetBundle={bundle}
                      theme={theme}
                      saveFidgetConfig={saveFidgetConfig}
                      isMobile={isMobile}
                      mobilePadding={MOBILE_PADDING}
                    />
                  </TabsContent>
                );
            })}
          </div>
        </Tabs>
      </div>
      
      {/* Mobile Navbar at bottom of screen */}
      {processedFidgetIds.length > 1 && (
        <MobileNavbar
          tabs={tabItems}
          selected={selectedTab}
          onSelect={setSelectedTab}
          theme={theme}
          fidgetInstanceDatums={fidgetInstanceDatums}
          tabNames={tabNames}
        />
      )}
    </div>
  );
};

export default MobileView;

import React, { useState, useMemo, useEffect } from "react";
import { TabsContent, Tabs } from "@/common/components/atoms/tabs";
import { MOBILE_PADDING, TAB_HEIGHT } from "@/constants/layout";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { 
  FidgetBundle, 
  FidgetConfig, 
  LayoutFidget, 
  LayoutFidgetConfig, 
  LayoutFidgetProps 
} from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
import { 
  createFidgetBundle, 
  getMediaFidgetIds, 
  getPinnedCastIds, 
  getValidFidgetIds, 
  processTabFidgetIds 
} from "./utils";
import TabNavigation from "./components/TabNavigation";
import ConsolidatedMediaContent from "./components/ConsolidatedMediaContent";
import ConsolidatedPinnedContent from "./components/ConsolidatedPinnedContent";
import FidgetContent from "./components/FidgetContent";

export interface TabFullScreenConfig extends LayoutFidgetConfig<string[]> {
  layout: string[];
}

type TabFullScreenProps = LayoutFidgetProps<TabFullScreenConfig> & {
  feed?: React.ReactNode; 
};

/**
 * Main TabFullScreen Layout component
 * 
 * This component provides a tabbed interface for displaying multiple fidgets,
 * with the ability to switch between them.
 */
const MobileStack: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
  hasFeed,
  feed,
}) => {
  const viewportMobile = useIsMobile();
  const { mobilePreview } = useMobilePreview();
  const isMobile = viewportMobile || mobilePreview;
  
  // Process fidgets and prepare data for rendering
  const validFidgetIds = useMemo(() => 
    getValidFidgetIds(layoutConfig.layout, fidgetInstanceDatums, isMobile),
  [layoutConfig.layout, fidgetInstanceDatums, isMobile]);
  
  const processedFidgetIds = useMemo(() => 
    processTabFidgetIds(layoutConfig.layout, fidgetInstanceDatums, isMobile),
  [layoutConfig.layout, fidgetInstanceDatums, isMobile]);
  
  const mediaFidgetIds = useMemo(() => 
    getMediaFidgetIds(validFidgetIds, fidgetInstanceDatums),
  [validFidgetIds, fidgetInstanceDatums]);
  
  const pinnedCastIds = useMemo(() => 
    getPinnedCastIds(validFidgetIds, fidgetInstanceDatums),
  [validFidgetIds, fidgetInstanceDatums]);
  
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

  const orderedFidgetIds = useMemo(() => processedFidgetIds, [processedFidgetIds]);

  // Initialize with the first fidget ID from orderedFidgetIds (feed will be first if it exists)
  const [selectedTab, setSelectedTab] = useState(
    orderedFidgetIds.length > 0 ? orderedFidgetIds[0] : ""
  );
  
  // Update selected tab when orderedFidgetIds changes
  useEffect(() => {
    // If there are no fidget IDs, do nothing
    if (orderedFidgetIds.length === 0) return;

    // If current selection is invalid, select the first one
    if (!orderedFidgetIds.includes(selectedTab)) {
      setSelectedTab(orderedFidgetIds[0]);
    }
    // We only care about changes to the ordered list of IDs.
    // selectedTab is intentionally omitted to avoid an extra render.
  }, [orderedFidgetIds]);
  
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Main content area with fixed height to keep tab bar visible */}
      <div
        className="w-full h-full overflow-hidden"
        style={{
          height:
            processedFidgetIds.length > 1
              ? `calc(100% - ${TAB_HEIGHT}px)`
              : '100%',
        }}
      >
        <Tabs
          value={selectedTab}
          className="w-full h-full"
          onValueChange={(value) => {
            console.log("Tab changed to:", value);
            setSelectedTab(value);
            window.scrollTo(0, 0);
          }}
        >
          <div className="relative z-20 h-full">
            {/* Special case for consolidated media tab */}
            {isMobile && mediaFidgetIds.length > 1 && (
              <TabsContent
                key="consolidated-media"
                value="consolidated-media"
                className="h-full w-full"
                style={{
                  display: selectedTab === 'consolidated-media' ? 'block' : 'none',
                }}
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
            {isMobile && pinnedCastIds.length > 1 && (
              <TabsContent
                key="consolidated-pinned"
                value="consolidated-pinned"
                className="h-full w-full"
                style={{
                  display: selectedTab === 'consolidated-pinned' ? 'block' : 'none',
                }}
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
            
            {hasFeed && feed && (
              <TabsContent
                key="feed"
                value="feed"
                className="h-full w-full"
                style={{
                  display: selectedTab === 'feed' ? 'block' : 'none',
                }}
              >
                <div className="h-full w-full px-4 py-2">
                  {feed}
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
                
                // Only render the content for the selected tab
                return (
                  <TabsContent
                    key={fidgetId}
                    value={fidgetId}
                    className="h-full w-full"
                    style={{
                      display: selectedTab === fidgetId ? 'block' : 'none',
                    }}
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
          
          {/* Tabs positioned at bottom - fixed for real mobile, absolute for mobile preview */}
          {processedFidgetIds.length > 1 && (
            <div
              className={`${viewportMobile ? 'fixed' : 'absolute'} bottom-0 left-0 right-0 z-30 bg-white`}
              style={{ height: `${TAB_HEIGHT}px` }}
            >
              <TabNavigation
                processedFidgetIds={orderedFidgetIds}
                selectedTab={selectedTab}
                fidgetInstanceDatums={fidgetInstanceDatums}
                isMobile={isMobile}
                tabNames={tabNames}
              />
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default MobileStack;
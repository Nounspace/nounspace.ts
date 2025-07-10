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
  isHomebasePath?: boolean;
};

const MobileStack: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
  hasFeed,
  feed,
  isHomebasePath = false,
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

  const orderedFidgetIds = useMemo(() => {
    let ids = [...processedFidgetIds];
    
    if (isHomebasePath && hasFeed && feed && !ids.includes("feed")) {
      // Check if feed fidget exists and is enabled for mobile display
      const feedFidget = fidgetInstanceDatums['feed'];
      const showFeedOnMobile = feedFidget?.config?.settings?.showOnMobile !== false;
      
      if (showFeedOnMobile) {
        ids = ["feed", ...ids];
      }
    }
    
    return ids;
  }, [processedFidgetIds, isHomebasePath, hasFeed, feed, fidgetInstanceDatums]);

  // Initialize with the first fidget ID from orderedFidgetIds (feed will be first if it exists)
  const [selectedTab, setSelectedTab] = useState(
    orderedFidgetIds.length > 0 ? orderedFidgetIds[0] : ""
  );
  
  useEffect(() => {
    if (orderedFidgetIds.length === 0) return;
    
    if (!orderedFidgetIds.includes(selectedTab)) {
      setSelectedTab(orderedFidgetIds[0]);
    }
  }, [orderedFidgetIds, selectedTab]);
  
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

  // If no valid fidgets and no feed in homebase, show empty state
  if (orderedFidgetIds.length === 0) {
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
        className="w-full overflow-hidden"
        style={{
          height:
            orderedFidgetIds.length > 1 || isHomebasePath
              ? `calc(100vh - ${TAB_HEIGHT}px)`
              : '100vh',
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
          <div className="relative z-level-2 h-full">
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
          
          {(orderedFidgetIds.length > 1 || isHomebasePath) && (
            <div
              className="fixed bottom-0 left-0 right-0 z-level-3 bg-white border-t"
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
import React, { useState, useMemo, useEffect } from "react";
import { TabsContent, Tabs } from "@/common/components/atoms/tabs";
import { MOBILE_PADDING, TAB_HEIGHT } from "@/constants/layout";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { usePathname } from "next/navigation";
import { 
  FidgetBundle, 
  FidgetConfig, 
  FidgetInstanceData, 
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

type TabFullScreenProps = LayoutFidgetProps<TabFullScreenConfig>;

/**
 * Main TabFullScreen Layout component
 * 
 * This component provides a tabbed interface for displaying multiple fidgets,
 * with the ability to switch between them.
 */
const TabFullScreen: LayoutFidget<TabFullScreenProps> = ({
  fidgetInstanceDatums,
  layoutConfig,
  theme,
  saveConfig,
  tabNames,
}) => {
  const viewportMobile = useIsMobile();
  const { mobilePreview } = useMobilePreview();
  const isMobile = viewportMobile || mobilePreview;
  const pathname = usePathname();
  const isHomebasePath = pathname?.startsWith('/homebase');
  const isHomePath = pathname?.startsWith('/home');
  
  // Process fidgets and prepare data for rendering
  const validFidgetIds = useMemo(() => 
    getValidFidgetIds(layoutConfig.layout, fidgetInstanceDatums, isMobile),
  [layoutConfig.layout, fidgetInstanceDatums, isMobile]);
  
  const processedFidgetIds = useMemo(
    () => processTabFidgetIds(layoutConfig.layout, fidgetInstanceDatums, isMobile),
    [layoutConfig.layout, fidgetInstanceDatums, isMobile],
  );

  // Reorder fidget IDs based on the mobileOrder setting when on mobile
  const mobileOrderedFidgetIds = useMemo(() => {
    if (!isMobile) return processedFidgetIds;

    const idsWithOrder = processedFidgetIds.map((id, idx) => {
      const order =
        fidgetInstanceDatums[id]?.config?.settings?.mobileOrder ?? idx + 1;
      return { id, order };
    });

    idsWithOrder.sort((a, b) => a.order - b.order);

    return idsWithOrder.map((item) => item.id);
  }, [isMobile, processedFidgetIds, fidgetInstanceDatums]);
  
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

  // Function to check if a fidget is a feed type
  const isFeedFidget = (fidgetId: string): boolean => {
    const fidgetDatum = fidgetInstanceDatums[fidgetId];
    if (!fidgetDatum) return false;
    
    return fidgetDatum.fidgetType === 'feed';
  };
  
  // Get ordered fidget IDs with feed prioritized (except in homebase)
  const orderedFidgetIds = useMemo(() => {
    if (!mobileOrderedFidgetIds || mobileOrderedFidgetIds.length <= 1) return mobileOrderedFidgetIds;

    // If we're in homebase or home path, don't reorder
    if (isHomebasePath || isHomePath) return mobileOrderedFidgetIds;

    // Create a copy of the array to avoid mutating the original
    const reorderedIds = [...mobileOrderedFidgetIds];
    
    // Sort the array to move feed fidgets to the beginning
    reorderedIds.sort((a, b) => {
      const aIsFeed = isFeedFidget(a);
      const bIsFeed = isFeedFidget(b);
      
      if (aIsFeed && !bIsFeed) return -1; // a is feed, b is not, so a comes first
      if (!aIsFeed && bIsFeed) return 1;  // b is feed, a is not, so b comes first
      return 0; // Keep original relative order if both are feeds or both are not feeds
    });
    
    return reorderedIds;
  }, [mobileOrderedFidgetIds, fidgetInstanceDatums, isHomebasePath, isHomePath]);

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
          onValueChange={setSelectedTab}
        >
          <div className="relative z-40 h-full">
            {/* Special case for consolidated media tab */}
            {isMobile && mediaFidgetIds.length > 1 && (
              <TabsContent
                key="consolidated-media"
                value="consolidated-media"
                className="h-full w-full data-[state=inactive]:hidden"
                forceMount
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
                className="h-full w-full data-[state=inactive]:hidden"
                forceMount
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
                
                // Only render the content for the selected tab
                return (
                  <TabsContent
                    key={fidgetId}
                    value={fidgetId}
                    className="h-full w-full data-[state=inactive]:hidden"
                    forceMount
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
          
          {/* Tabs fixed to bottom of screen */}
          {processedFidgetIds.length > 1 && (
            <div
              className={`${viewportMobile ? 'fixed' : 'absolute'} bottom-0 left-0 right-0 z-50 bg-white`}
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

export default TabFullScreen;
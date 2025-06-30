import React, { useState, useMemo, useEffect } from "react";
import { TabsContent, Tabs } from "@/common/components/atoms/tabs";
import { MOBILE_PADDING, TAB_HEIGHT } from "@/constants/layout";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { usePathname } from "next/navigation";
import {
  FidgetBundle,
  FidgetConfig,
  LayoutFidget,
  LayoutFidgetConfig,
  LayoutFidgetProps,
} from "@/common/fidgets";
import { CompleteFidgets } from "@/fidgets";
import { createFidgetBundle } from "./utils";
import ConsolidatedMediaContent from "./components/ConsolidatedMediaContent";
import ConsolidatedPinnedContent from "./components/ConsolidatedPinnedContent";
import FidgetContent from "./components/FidgetContent";
import MobileNavbar from "@/common/components/organisms/MobileNavbar";
import { createTabItemsFromFidgetIds } from "@/common/utils/layoutUtils";
import useProcessedFidgetIds from "@/common/lib/hooks/useProcessedFidgetIds";
import { UserTheme } from "@/common/lib/theme";
import defaultUserTheme from "@/common/lib/theme/defaultTheme";

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
  const isMobile = useIsMobile();

  // Use the unified hook to process fidget IDs
  const {
    validFidgetIds,
    processedFidgetIds,
    mediaFidgetIds,
    pinnedCastIds,
    orderedFidgetIds,
  } = useProcessedFidgetIds(
    layoutConfig.layout,
    fidgetInstanceDatums,
    isMobile
  );

  // Create tab items for the MobileNavbar
  const tabItems = useMemo(
    () =>
      createTabItemsFromFidgetIds(
        orderedFidgetIds,
        fidgetInstanceDatums,
        tabNames
      ),
    [orderedFidgetIds, fidgetInstanceDatums, tabNames]
  );

  // Initialize with the first fidget ID
  const [selectedTab, setSelectedTab] = useState(
    orderedFidgetIds.length > 0 ? orderedFidgetIds[0] : ""
  );

  // Create bundles for all fidgets
  const fidgetBundles = useMemo(() => {
    const bundles: Record<string, FidgetBundle> = {};

    validFidgetIds.forEach((id) => {
      const fidgetData = fidgetInstanceDatums[id];
      if (!fidgetData) return;

      const bundle = createFidgetBundle(fidgetData, false);
      if (bundle) {
        bundles[id] = bundle;
      }
    });

    return bundles;
  }, [validFidgetIds, fidgetInstanceDatums]);

  // Update selected tab when orderedFidgetIds changes
  useEffect(() => {
    // If there are no fidget IDs, do nothing
    if (orderedFidgetIds.length === 0) return;

    // If current selection is invalid, select the first one
    if (!orderedFidgetIds.includes(selectedTab)) {
      setSelectedTab(orderedFidgetIds[0]);
    }
  }, [orderedFidgetIds, selectedTab]);

  // Reset scroll position when switching between tabs on mobile
  useEffect(() => {
    if (isMobile && selectedTab) {
      // Reset scroll position to top when switching tabs
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedTab, isMobile]);

  // Configuration saving function
  const saveFidgetConfig =
    (id: string) =>
    (newConfig: FidgetConfig): Promise<void> => {
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
          <p className="text-sm text-gray-400">
            Add some fidgets to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Main content area with padding-bottom to make space for fixed tabs */}
      <div
        className="w-full h-full overflow-hidden"
        style={{
          paddingBottom:
            processedFidgetIds.length > 1 ? `${TAB_HEIGHT}px` : "0",
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
                style={{ visibility: "visible", display: "block" }}
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
                className="h-full w-full block"
                style={{ visibility: "visible", display: "block" }}
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
              .filter(
                (id) =>
                  id !== "consolidated-media" && id !== "consolidated-pinned"
              )
              .map((fidgetId) => {
                const fidgetDatum = fidgetInstanceDatums[fidgetId];
                if (!fidgetDatum) return null;

                const fidgetModule = CompleteFidgets[fidgetDatum.fidgetType];
                if (!fidgetModule) return null;

                const bundle =
                  fidgetBundles[fidgetId] ||
                  createFidgetBundle(fidgetDatum, false);
                if (!bundle) return null;

                // Only render the content for the selected tab
                return (
                  <TabsContent
                    key={fidgetId}
                    value={fidgetId}
                    className="h-full w-full block"
                    style={{ visibility: "visible", display: "block" }}
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
            <MobileNavbar
              tabs={tabItems}
              selected={selectedTab}
              onSelect={setSelectedTab}
              theme={(theme as UserTheme) || defaultUserTheme}
              fidgetInstanceDatums={fidgetInstanceDatums}
              tabNames={tabNames}
            />
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default TabFullScreen;

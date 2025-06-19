"use client";
import React, { ReactNode, useEffect, useMemo, Suspense } from "react";
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
  LayoutFidgetSavableConfig as LayoutFidgetSaveableConfig,
} from "@/common/fidgets";
import { UserTheme } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { isNil, isUndefined } from "lodash";
import InfoToast from "@/common/components/organisms/InfoBanner";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import SpaceLoading from "./SpaceLoading";
// Import the LayoutFidgets directly
import { LayoutFidgets } from "@/fidgets";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { PlacedGridItem } from "@/fidgets/layout/Grid";
import { cleanupLayout } from '@/common/lib/utils/gridCleanup';

export type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>;
  fidgetType: string;
  id: string;
};

export type SpaceConfig = {
  fidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails<LayoutFidgetConfig<any>>;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
  theme: UserTheme;
  timestamp?: string;
  tabNames?: string[];
  fid?: number;
};

export type SpaceConfigSaveDetails = Partial<
  Omit<SpaceConfig, "layoutDetails">
> & {
  layoutDetails?: Partial<LayoutFidgetDetails<LayoutFidgetConfig<any>>>;
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  tabBar: ReactNode;
  profile?: ReactNode;
  feed?: ReactNode;
  setEditMode: (v: boolean) => void;
  editMode: boolean;
  editWithAiMode?: boolean;
  setSidebarEditable: (v: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
};

export default function Space({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  tabBar,
  profile,
  feed,
  setEditMode,
  editMode,
  editWithAiMode = false,
  setSidebarEditable,
  portalRef,
}: SpaceArgs) {
  // Use the useIsMobile hook instead of duplicating logic
  const isMobile = useIsMobile();

  useEffect(() => {
    setSidebarEditable(config.isEditable);
  }, [config.isEditable]);

  // Use a ref to track if cleanup has run
  const cleanupHasRun = React.useRef(false);

  // Clean up unused fidgetInstanceDatums when config is first loaded
  useEffect(() => {
    // Skip if cleanup has already run
    if (cleanupHasRun.current) {
      return;
    }

    // Skip if config is not loaded
    if (
      !config?.layoutDetails?.layoutConfig?.layout ||
      !config?.fidgetInstanceDatums
    ) {
      return;
    }

    // Get fidget IDs from layout
    const layoutFidgetIds = new Set(
      config.layoutDetails.layoutConfig.layout.map((item) => item.i)
    );

    // Identify layout items that reference missing fidget data
    const orphanedLayoutItems = config.layoutDetails.layoutConfig.layout.filter(
      (item) => !config.fidgetInstanceDatums[item.i]
    );

    // Remove orphaned layout items
    const layoutWithoutOrphans = config.layoutDetails.layoutConfig.layout.filter(
      (item) => !!config.fidgetInstanceDatums[item.i]
    );

    const orphanedIds = orphanedLayoutItems.map((item) => item.i);

    // Find unused fidgets
    const unusedFidgetIds = Object.keys(config.fidgetInstanceDatums).filter(
      (id) => !layoutFidgetIds.has(id)
    );

    // Remove unused fidgets
    if (unusedFidgetIds.length > 0) {
      const cleanedFidgetInstanceDatums = { ...config.fidgetInstanceDatums };
      unusedFidgetIds.forEach((id) => {
        delete cleanedFidgetInstanceDatums[id];
      });

      // Only save if we have fidgets left
      if (Object.keys(cleanedFidgetInstanceDatums).length > 0) {
        saveConfig({
          fidgetInstanceDatums: cleanedFidgetInstanceDatums,
          timestamp: new Date().toISOString(),
        }).then(() => {
          commitConfig();
        });
      }
    }

    // Check for and handle overlapping fidgets on the filtered layout
    const { cleanedLayout: cleanedAfterOverlap, removedFidgetIds } = cleanupLayout(
      layoutWithoutOrphans,
      config.fidgetInstanceDatums,
      !isNil(profile),
      !isNil(feed)
    );

    const cleanedLayout = cleanedAfterOverlap;
    const allRemovedIds = [...removedFidgetIds, ...orphanedIds];

    const cleanedFidgetInstanceDatums = { ...config.fidgetInstanceDatums };
    allRemovedIds.forEach(id => {
      delete cleanedFidgetInstanceDatums[id];
    });
    
    let settingsChanged = false;
    let datumFieldsUpdated = false;

    // Normalize configuration keys and ensure required fields
    Object.keys(cleanedFidgetInstanceDatums).forEach((id) => {
      const datum = cleanedFidgetInstanceDatums[id];
      const settings = datum.config?.settings as Record<string, unknown> | undefined;

      if (settings) {
        const keyMap: Record<string, string> = {
          "fidget Shadow": "fidgetShadow",
          "font Color": "fontColor",
        };
        Object.entries(keyMap).forEach(([oldKey, newKey]) => {
          if (oldKey in settings) {
            settings[newKey] = settings[oldKey];
            delete settings[oldKey];
            settingsChanged = true;
          }
        });
      }

      if (!datum.fidgetType || !datum.id) {
        cleanedFidgetInstanceDatums[id] = {
          ...datum,
          fidgetType: datum.fidgetType || id.split(":")[0],
          id: datum.id || id,
        };
        datumFieldsUpdated = true;
      }
    });

    // Make Queued Changes
    const layoutChanged =
      cleanedLayout.length !== config.layoutDetails.layoutConfig.layout.length ||
      cleanedLayout.some(
        (item, i) =>
          item.x !== config.layoutDetails.layoutConfig.layout[i]?.x ||
          item.y !== config.layoutDetails.layoutConfig.layout[i]?.y ||
          item.i !== config.layoutDetails.layoutConfig.layout[i]?.i ||
          item.w !== config.layoutDetails.layoutConfig.layout[i]?.w ||
          item.h !== config.layoutDetails.layoutConfig.layout[i]?.h
      );

    if (allRemovedIds.length > 0 || layoutChanged || settingsChanged || datumFieldsUpdated) {
      saveConfig({
        layoutDetails: {
          layoutConfig: {
            ...config.layoutDetails.layoutConfig,
            layout: cleanedLayout,
          },
        },
        fidgetInstanceDatums: cleanedFidgetInstanceDatums,
        timestamp: new Date().toISOString(),
      }).then(() => {
        commitConfig();
      });
    }

    // Mark cleanup as complete
    cleanupHasRun.current = true;
  }, []); // Run only once on mount

  function saveExitEditMode() {
    commitConfig();
    setEditMode(false);
  }

  function cancelExitEditMode() {
    resetConfig();
    setEditMode(false);
  }

  async function saveLocalConfig({
    theme,
    layoutConfig,
    fidgetInstanceDatums,
    fidgetTrayContents,
  }: Partial<LayoutFidgetSaveableConfig<LayoutFidgetConfig<any>>>) {
    return saveConfig({
      layoutDetails: layoutConfig
        ? {
            layoutConfig,
          }
        : undefined,
      theme,
      fidgetInstanceDatums,
      fidgetTrayContents,
    });
  }

  // Memoize the LayoutFidget component selection based on mobile state
  const LayoutFidget = useMemo(() => {
    if (isMobile) {
      // Use TabFullScreen for mobile
      return LayoutFidgets["tabFullScreen"];
    } else {
      // Use the configured layout for desktop or fallback to "grid"
      const layoutFidgetKey =
        config?.layoutDetails?.layoutFidget &&
        LayoutFidgets[config.layoutDetails.layoutFidget]
          ? config.layoutDetails.layoutFidget
          : "grid";
      return LayoutFidgets[layoutFidgetKey];
    }
  }, [isMobile, config?.layoutDetails?.layoutFidget]);

  // Memoize the layoutConfig to prevent unnecessary re-renders
  const layoutConfig = useMemo(() => {
    if (isMobile) {
      // Extract fidget IDs from the current config to use in TabFullScreen
      const fidgetIds = Object.keys(config.fidgetInstanceDatums || {});

      // Create a layout config for TabFullScreen with all available fidget IDs
      return {
        layout: fidgetIds,
        layoutFidget: "tabFullScreen",
      };
    } else {
      return (
        config?.layoutDetails?.layoutConfig ?? {
          layout: [],
          layoutFidget: "grid",
        }
      );
    }
  }, [
    isMobile,
    config?.layoutDetails?.layoutConfig,
    config?.fidgetInstanceDatums,
  ]);

  // Memoize the LayoutFidget render props that don't change during fidget movement
  const layoutFidgetProps = useMemo(() => {
    return {
      theme: config.theme,
      fidgetInstanceDatums: config.fidgetInstanceDatums,
      fidgetTrayContents: config.fidgetTrayContents,
      inEditMode: !isMobile && editMode && !editWithAiMode, // Manual edit mode only, not AI mode
      saveExitEditMode: saveExitEditMode,
      cancelExitEditMode: cancelExitEditMode,
      portalRef: portalRef,
      saveConfig: saveLocalConfig,
      hasProfile: !isMobile && !isNil(profile),
      hasFeed: !isNil(feed),
      tabNames: config.tabNames,
      fid: config.fid,
    };
  }, [
    config.theme,
    config.fidgetInstanceDatums,
    config.fidgetTrayContents,
    config.tabNames,
    config.fid,
    isMobile,
    editMode,
    editWithAiMode,
    portalRef,
    profile,
    feed,
  ]);

  if (!LayoutFidget) {
    console.error("LayoutFidget is undefined");
  }

  return (
    <div className="user-theme-background w-full h-full relative flex-col">
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
      <div className="w-full transition-all duration-100 ease-out">
        <div className="flex flex-col h-full">
          <div style={{ position: "fixed", zIndex: 9999 }}>
            <InfoToast />
          </div>
          {!isUndefined(profile) ? (
            <div className="z-50 bg-white md:h-40">{profile}</div>
          ) : null}

          <div className="relative">
            <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
            {/* Gradient overlay for tabs on mobile */}
            {isMobile && (
              <div
                className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none opacity-90 z-50"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 1) 100%)",
                }}
              />
            )}
          </div>

          <div className={isMobile ? "w-full h-full" : "flex h-full"}>
            {!isUndefined(feed) && !isMobile ? (
              <div className="w-6/12 h-[calc(100vh-64px)]">{feed}</div>
            ) : null}

            <div className={isMobile ? "w-full h-full" : "grow"}>
              <Suspense
                fallback={
                  <SpaceLoading
                    hasProfile={!isNil(profile)}
                    hasFeed={!isNil(feed)}
                  />
                }
              >
                {LayoutFidget ? (
                  <LayoutFidget
                    layoutConfig={{ ...layoutConfig }}
                    {...layoutFidgetProps}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <SpaceLoading
                      hasProfile={!isNil(profile)}
                      hasFeed={!isNil(feed)}
                    />
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

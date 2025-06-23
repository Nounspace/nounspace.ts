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
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";
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
        // Safer approach: don't rely on splitting the id string
        // Use existing fidgetType or fallback to "unknown"
        cleanedFidgetInstanceDatums[id] = {
          ...datum,
          fidgetType: datum.fidgetType || "unknown",
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

  // Get mobile fidget IDs from the current config
  const mobileFidgetIds = useMemo(() => 
    Object.keys(config.fidgetInstanceDatums || {}),
  [config?.fidgetInstanceDatums]);
  
  // Get desktop layout config from config or use default
  const desktopLayoutConfig = useMemo(() => 
    config?.layoutDetails?.layoutConfig ?? {
      layout: [],
      layoutFidget: "grid",
    },
  [config?.layoutDetails?.layoutConfig]);

  return (
    <div className="user-theme-background size-full relative overflow-hidden">
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
      <div className="w-full h-full transition-all duration-100 ease-out relative z-10">
        <div className="flex flex-col h-full">
          <div style={{ position: "fixed", zIndex: 9999 }}>
            <InfoToast />
          </div>
          {!isUndefined(profile) ? (
            <div className="z-50 bg-white md:h-40">{profile}</div>
          ) : null}

          <div className="relative">
            <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
          </div>

          <div className={isMobile ? "size-full" : "flex h-full"}>
            {!isUndefined(feed) && !isMobile ? (
              <div
                className={
                  !isUndefined(profile)
                    ? "w-6/12 h-[calc(100vh-224px)]"
                    : "w-6/12 h-[calc(100vh-64px)]"
                }
              >
                {feed}
              </div>
            ) : null}

            <div
              className={
                isMobile
                  ? "size-full"
                  : !isUndefined(profile)
                    ? "grow h-[calc(100vh-224px)]"
                    : "grow h-[calc(100vh-64px)]"
              }
            >
              <Suspense
                fallback={
                  <SpaceLoading
                    hasProfile={!isNil(profile)}
                    hasFeed={!isNil(feed)}
                  />
                }
              >
                {isMobile ? (
                  <MobileView
                    fidgetInstanceDatums={config.fidgetInstanceDatums}
                    layoutFidgetIds={mobileFidgetIds}
                    theme={config.theme}
                    saveConfig={saveLocalConfig}
                    tabNames={config.tabNames}
                  />
                ) : (
                  <DesktopView
                    layoutConfig={{ ...desktopLayoutConfig }}
                    theme={config.theme}
                    fidgetInstanceDatums={config.fidgetInstanceDatums}
                    fidgetTrayContents={config.fidgetTrayContents}
                    inEditMode={editMode}
                    saveExitEditMode={saveExitEditMode}
                    cancelExitEditMode={cancelExitEditMode}
                    portalRef={portalRef}
                    saveConfig={saveLocalConfig}
                    hasProfile={!isNil(profile)}
                    hasFeed={!isNil(feed)}
                    tabNames={config.tabNames}
                    fid={config.fid}
                  />
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

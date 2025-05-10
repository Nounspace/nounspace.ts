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

  // Memoize the layoutConfig to prevent unnecessary re-renders
  const layoutConfig = useMemo(() => {
    if (isMobile) {
      // Extract fidget IDs from the current config to use in MobileView
      const fidgetIds = Object.keys(config.fidgetInstanceDatums || {});

      // Create a layout config for mobile with all available fidget IDs
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
                {isMobile ? (
                  <MobileView
                    fidgetInstanceDatums={config.fidgetInstanceDatums}
                    layoutFidgetIds={layoutConfig.layout}
                    theme={config.theme}
                    saveConfig={saveLocalConfig}
                    tabNames={config.tabNames}
                  />
                ) : (
                  <DesktopView
                    layoutConfig={{ ...layoutConfig }}
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

"use client";
import React, { ReactNode, useEffect, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
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
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import { isNil, isUndefined } from "lodash";
import InfoToast from "@/common/components/organisms/InfoBanner";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import SpaceLoading from "./SpaceLoading";
// Import the LayoutFidgets directly
import { LayoutFidgets } from "@/fidgets";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import Image from "next/image";
import { PlacedGridItem } from "@/fidgets/layout/Grid";
import { cleanupLayout } from '@/common/lib/utils/gridCleanup';
import { TAB_HEIGHT } from "@/constants/layout";

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
  const viewportMobile = useIsMobile();
  const { mobilePreview, setMobilePreview } = useMobilePreview();
  const isMobile = viewportMobile || mobilePreview;
  const showMobileContainer = mobilePreview && !viewportMobile;

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
  
      // Check for and handle overlapping fidgets
      const { cleanedLayout, removedFidgetIds } = cleanupLayout(
        config.layoutDetails.layoutConfig.layout,
        config.fidgetInstanceDatums,
        !isNil(profile),
        !isNil(feed)
      );
  
      const cleanedFidgetInstanceDatums = { ...config.fidgetInstanceDatums };
      removedFidgetIds.forEach(id => {
        delete cleanedFidgetInstanceDatums[id];
      });
  
      let settingsChanged = false;
      // Check and rename 'fidget Shadow' to 'fidgetShadow' in each fidget's config settings
      Object.keys(cleanedFidgetInstanceDatums).forEach((id) => {
        const datum = cleanedFidgetInstanceDatums[id];
        const settings = datum.config?.settings as Record<string, unknown>;
        if (settings && "fidget Shadow" in settings) {
          settings.fidgetShadow = settings["fidget Shadow"];
          delete settings["fidget Shadow"];
          settingsChanged = true;
        }
        if (settings && "fidget Shadow" in settings) {
          settings.fidgetShadow = settings["fidget Shadow"];
          delete settings["fidget Shadow"];
          settingsChanged = true;
        }
      });
  
      // Make Queued Changes
      if (removedFidgetIds.length > 0 || 
        cleanedLayout.some((item, i) => item.x !== config.layoutDetails.layoutConfig.layout[i].x || 
        item.y !== config.layoutDetails.layoutConfig.layout[i].y) ||
        settingsChanged) {
  
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
    setMobilePreview(false);
  }

  function cancelExitEditMode() {
    resetConfig();
    setEditMode(false);
    setMobilePreview(false);
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
      inEditMode: !viewportMobile && editMode, // No edit mode on mobile screens
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
    viewportMobile,
    editMode,
    portalRef,
    profile,
    feed,
  ]);

  if (!LayoutFidget) {
    console.error("LayoutFidget is undefined");
  }

  const mainContent = (
    <div className="flex flex-col h-full">
      <div style={{ position: "fixed", zIndex: 9999 }}>
        <InfoToast />
      </div>
      {!isUndefined(profile) ? (
        <div className="z-50 bg-white md:h-40">{profile}</div>
      ) : null}

      <div className="relative">
        <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
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
  );

  return (
    <>
      {showMobileContainer && editMode && portalRef.current
        ? createPortal(
            <aside
              id="logo-sidebar"
              className="h-screen flex-row flex bg-white"
              aria-label="Sidebar"
            >
              <div className="flex-1 w-[270px] h-full max-h-screen pt-12 flex-col flex px-4 py-4 overflow-y-auto border-r">
                <ThemeSettingsEditor
                  theme={config.theme}
                  saveTheme={(newTheme) =>
                    saveLocalConfig({ theme: newTheme })
                  }
                  saveExitEditMode={saveExitEditMode}
                  cancelExitEditMode={cancelExitEditMode}
                  fidgetInstanceDatums={config.fidgetInstanceDatums}
                  saveFidgetInstanceDatums={(datums) =>
                    saveLocalConfig({ fidgetInstanceDatums: datums })
                  }
                />
              </div>
            </aside>,
            portalRef.current,
          )
        : null}
      <div
        className={`w-full h-full relative flex-col ${
          showMobileContainer ? "" : "user-theme-background"
        }`}
      >
        {showMobileContainer && (
          <Image
            src="https://i.ibb.co/mrvFkWhM/Smartphone-mock-1.png"
            alt="Mobile preview background"
            fill
            className="object-cover pointer-events-none select-none -z-10"
          />
        )}
        <div className="w-full transition-all duration-100 ease-out">
          {showMobileContainer ? (
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="https://i.ibb.co/zW7k3HKk/Chat-GPT-Image-May-29-2025-12-17-27-PM.png"
                  alt="Phone mockup"
                  width={344}
                  height={744}
                  className="pointer-events-none select-none"
                />
                <div className="absolute top-[35px] left-[16px]">
                  <div
                    className="user-theme-background w-[312px] h-[675px] relative overflow-auto"
                    style={{ paddingBottom: `${TAB_HEIGHT}px` }}
                  >
                    <CustomHTMLBackground
                      html={config.theme?.properties.backgroundHTML}
                      className="absolute inset-0 pointer-events-none"
                    />
                    {mainContent}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
              {mainContent}
            </>
          )}
        </div>
      </div>
    </>
  );
}

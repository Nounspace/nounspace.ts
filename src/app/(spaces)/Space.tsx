"use client";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import InfoToast from "@/common/components/organisms/InfoBanner";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
  LayoutFidgetSavableConfig as LayoutFidgetSaveableConfig,
} from "@/common/fidgets";
import { UserTheme } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import { isNil, isUndefined } from "lodash";
import React, { ReactNode, Suspense, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import SpaceLoading from "./SpaceLoading";
// Import the LayoutFidgets directly
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import { cleanupLayout } from '@/common/lib/utils/gridCleanup';
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { LayoutFidgets } from "@/fidgets";
import Image from "next/image";


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
  const viewportMobile = useIsMobile();
  const { mobilePreview, setMobilePreview } = useMobilePreview();

  const isMobile = useMemo(() => viewportMobile || mobilePreview, [viewportMobile, mobilePreview]);
  const showMobileContainer = useMemo(() => mobilePreview && !viewportMobile, [mobilePreview, viewportMobile]);

  useEffect(() => {
    setSidebarEditable(config.isEditable);
  }, [config.isEditable]);

  const cleanupHasRun = React.useRef(false);

  useEffect(() => {
    if (cleanupHasRun.current) {
      return;
    }

    if (
      !config?.layoutDetails?.layoutConfig?.layout ||
      !config?.fidgetInstanceDatums
    ) {
      return;
    }

    const layoutFidgetIds = new Set(
      config.layoutDetails.layoutConfig.layout.map((item) => item.i)
    );

    const unusedFidgetIds = Object.keys(config.fidgetInstanceDatums).filter(
      (id) => !layoutFidgetIds.has(id)
    );
    if (unusedFidgetIds.length > 0) {
      const cleanedFidgetInstanceDatums = { ...config.fidgetInstanceDatums };
      unusedFidgetIds.forEach((id) => {
        delete cleanedFidgetInstanceDatums[id];
      });
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
  }, []);

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
      return LayoutFidgets["tabFullScreen"];
    } else {
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
      const fidgetIds = Object.keys(config.fidgetInstanceDatums || {});

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
      inEditMode: !viewportMobile && editMode,
      saveExitEditMode: saveExitEditMode,
      cancelExitEditMode: cancelExitEditMode,
      portalRef: portalRef,
      saveConfig: saveLocalConfig,
      hasProfile: !isNil(profile),
      hasFeed: !isNil(feed),
      feed: feed,
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
    <div className="flex flex-col h-full overflow-y-auto md:overflow-y-visible touch-auto">
      <div style={{ position: "fixed" }} className="z-level-4">
        <InfoToast />
      </div>
      {!isUndefined(profile) ? (
        <div className={`z-level-3 bg-white ${isMobile ? "flex-shrink-0" : "md:h-40 flex-shrink-0"}`}>{profile}</div>
      ) : null}

      <div className="relative flex-shrink-0 bg-white">
        {!isMobile && (
          <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
        )}
        {isMobile && (
          <div className="w-full border-b flex-shrink-0" style={{ backgroundColor: 'white' }}>
            <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
          </div>
        )}
      </div>

      <div className={isMobile ? "w-full h-full flex-grow overflow-y-auto touch-auto" : "flex h-full flex-grow touch-auto"}>
        {!isUndefined(feed) && !isMobile ? (
          <div className="w-6/12 h-[calc(100vh-64px)] flex-shrink-0 overflow-y-auto touch-auto">{feed}</div>
        ) : null}

        <div className={isMobile ? "w-full h-full flex-grow overflow-y-auto touch-auto" : "grow touch-auto"}>

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
        className={`w-full h-full relative ${showMobileContainer
          ? "flex flex-col items-center justify-center"
          : "user-theme-background flex flex-col"
          }`}
        style={{
          backgroundColor: showMobileContainer ? undefined : config.theme?.properties.background
        }}
      >
        {showMobileContainer && (
          <Image
            src="https://i.ibb.co/pjYr9zFr/Chat-GPT-Image-May-29-2025-01-35-55-PM.png"
            alt="Mobile preview background"
            fill
            className="object-cover pointer-events-none select-none -z-10"
          />
        )}
        <div className="w-full h-full transition-all duration-100 ease-out">
          {showMobileContainer ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative w-[344px] h-[744px]">
                <div className="absolute top-[10px] left-[16px] z-0">
                  <div
                    className="w-[312px] h-[675px] relative overflow-hidden rounded-[32px] shadow-lg"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: config.theme?.properties.background || 'white',
                      transform: 'scale(1.0)',
                      transformOrigin: 'top left'
                    }}
                  >
                    <CustomHTMLBackground
                      html={config.theme?.properties.backgroundHTML}
                      className="absolute inset-0 pointer-events-none w-full h-full"
                    />
                          <div className="flex-1 w-full overflow-auto" >
                   
                      <div className="relative w-full h-full flex flex-col">
                        <div className="w-full bg-white">
                          {!isUndefined(profile) ? (
                            <div className="w-full max-h-fit">
                              <div className="rounded-md shadow-sm overflow-hidden">
                                {profile}
                              </div>
                            </div>
                          ) : null}

                          <div className="border-b relative">
                            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                              {tabBar}
                            </div>
                          </div>

                          {!isUndefined(feed) && !isMobile ? (
                            <div className="w-full overflow-auto bg-white">
                              {feed}
                            </div>
                          ) : null}
                        </div>

                        <Suspense fallback={
                          <SpaceLoading
                            hasProfile={!isNil(profile)}
                            hasFeed={!isNil(feed)}
                          />
                        }>
                          {LayoutFidget ? (
                            <LayoutFidget
                              layoutConfig={{ ...layoutConfig }}
                              {...layoutFidgetProps}
                              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 9999 }}
                            /> 
                          ) : (
                              <SpaceLoading
                                hasProfile={!isNil(profile)}
                                hasFeed={!isNil(feed)}
                              />
                          
                          )}
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
                <Image
                  src="https://i.ibb.co/nsLJDmpT/Smartphone-mock-3.png"
                  alt="Phone mockup"
                  width={344}
                  height={744}
                  className="pointer-events-none select-none absolute inset-0 z-10"
                />
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
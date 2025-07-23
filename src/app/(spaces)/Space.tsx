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
import { isNil, isUndefined } from "lodash";
import React, { ReactNode, Suspense, useEffect, useMemo } from "react";
import SpaceLoading from "./SpaceLoading";
// Import the LayoutFidgets directly
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import { comprehensiveCleanup } from '@/common/lib/utils/gridCleanup';
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { extractFidgetIdsFromLayout } from "@/fidgets/layout/tabFullScreen/utils";
import { createPortal } from "react-dom";
import DesktopView from "./DesktopView";
import MobilePreview from "./MobilePreview";
import MobileViewSimplified from "./MobileViewSimplified";


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
  showFeedOnMobile?: boolean;
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
  showFeedOnMobile,
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
    if (cleanupHasRun.current || !config?.layoutDetails?.layoutConfig?.layout || !config?.fidgetInstanceDatums) {
      return;
    }

    const { cleanedLayout, cleanedFidgetInstanceDatums, hasChanges } = comprehensiveCleanup(
      config.layoutDetails.layoutConfig.layout,
      config.fidgetInstanceDatums,
      !isNil(profile),
      !isNil(feed)
    );

    if (hasChanges) {
      saveConfig({
        layoutDetails: {
          layoutConfig: {
            ...config.layoutDetails.layoutConfig,
            layout: cleanedLayout,
          },
        },
        fidgetInstanceDatums: cleanedFidgetInstanceDatums,
        timestamp: new Date().toISOString(),
      }).then(commitConfig);
    }

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

  // Memoize base layout props shared across all layout components
  const baseLayoutProps = useMemo(() => {
    return {
      theme: config.theme,
      fidgetInstanceDatums: config.fidgetInstanceDatums,
      fidgetTrayContents: config.fidgetTrayContents,
      layoutConfig: config?.layoutDetails?.layoutConfig,
      saveExitEditMode: saveExitEditMode,
      cancelExitEditMode: cancelExitEditMode,
      portalRef: portalRef,
      saveConfig: saveLocalConfig,
      hasProfile: !isNil(profile),
      hasFeed: !isNil(feed),
      feed: feed,
      tabNames: config.tabNames,
      fid: config.fid,
      inEditMode: !viewportMobile && editMode,
    };
  }, [
    config.theme,
    config.fidgetInstanceDatums,
    config.fidgetTrayContents,
    config?.layoutDetails?.layoutConfig,
    config.tabNames,
    config.fid,
    portalRef,
    profile,
    feed,
    viewportMobile,
    editMode,
  ]);

  // Memoize DesktopView specific props
  const desktopViewProps = useMemo(() => {
    return {
      ...baseLayoutProps,
      layoutFidgetKey: config?.layoutDetails?.layoutFidget,
      inEditMode: !viewportMobile && editMode,
    };
  }, [baseLayoutProps, config?.layoutDetails?.layoutFidget, viewportMobile, editMode]);

  const mainContent = (
    <div className="flex flex-col h-full">
      <div className="z-50" style={{ position: "fixed" }}>
        <InfoToast />
      </div>
      {!isUndefined(profile) ? (
        <div className="z-50 bg-white md:h-40">{profile}</div>
      ) : null}

      <div className="relative">
        <Suspense fallback={<TabBarSkeleton />}>{tabBar}</Suspense>
      </div>

      <div className={isMobile ? "size-full" : "flex h-full"}>
        {/* Feed section */}
        {!isUndefined(feed) && (!isMobile || showFeedOnMobile) ? (
          <div
            className={
              isMobile && showFeedOnMobile
                ? "size-full"
                : !isUndefined(profile)
                  ? "w-6/12 h-[calc(100vh-224px)]"
                  : "w-6/12 h-[calc(100vh-64px)]"
            }
          >
            {feed}
          </div>
        ) : null}

        {/* Main layout */}
        {!(isMobile && showFeedOnMobile) && (
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
                <MobileViewSimplified
                  {...baseLayoutProps}
                  layoutFidgetIds={extractFidgetIdsFromLayout(
                    config?.layoutDetails?.layoutConfig?.layout,
                    config.fidgetInstanceDatums
                  )}
                />
              ) : (
                <DesktopView {...desktopViewProps} />
              )}
            </Suspense>
          </div>
        )}
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
          backgroundColor: showMobileContainer ? undefined : config.theme?.properties.background,
          ...(showMobileContainer && {
           backgroundImage: "url('/images/space-background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh'
          })
        }}
      >
        <div className="w-full h-full transition-all duration-100 ease-out">
          {showMobileContainer ? (
            <MobilePreview
              theme={config.theme}
              editMode={editMode}
              portalRef={portalRef}
              profile={profile}
              tabBar={tabBar}
              feed={feed}
              saveTheme={(newTheme) => saveLocalConfig({ theme: newTheme })}
              saveExitEditMode={saveExitEditMode}
              cancelExitEditMode={cancelExitEditMode}
              fidgetInstanceDatums={config.fidgetInstanceDatums}
              saveFidgetInstanceDatums={(datums) =>
                saveLocalConfig({ fidgetInstanceDatums: datums })
              }
              layoutConfig={config?.layoutDetails?.layoutConfig}
              fidgetTrayContents={config.fidgetTrayContents}
              saveConfig={saveLocalConfig}
              tabNames={config.tabNames}
              fid={config.fid}
            />
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
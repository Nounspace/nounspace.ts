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
import { comprehensiveCleanup } from '@/common/lib/utils/gridCleanup';
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import DesktopView from "./DesktopView";
import MobilePreview from "./MobilePreview";
import MobileView from "./MobileView";
import { extractFidgetIdsFromLayout } from "@/fidgets/layout/tabFullScreen/utils";


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

        {/* Make space for feed if it exists */}
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

        {/* Main layout */}
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
      </div>
    </div>
  );

  return (
    <>
      {showMobileContainer ? (
        <MobilePreview
          {...baseLayoutProps}
          editMode={editMode}
          profile={profile}
          tabBar={tabBar}
          saveTheme={(newTheme) => saveLocalConfig({ theme: newTheme })}
          saveFidgetInstanceDatums={(datums) =>
            saveLocalConfig({ fidgetInstanceDatums: datums })
          }
        />
      ) : (
        <div className="user-theme-background size-full relative overflow-hidden">
          <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
          <div className="w-full h-full transition-all duration-100 ease-out relative z-10">
            {mainContent}
          </div>
        </div>
      )}
    </>
  );
}
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
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { LayoutFidgets } from "@/fidgets";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHomebasePath = pathname?.startsWith('/homebase');

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
    if (fidgetInstanceDatums) {
      console.log('🔄 Space.tsx saveLocalConfig - fidgetInstanceDatums:', Object.values(fidgetInstanceDatums).map(d => ({ id: d.id })));
    }
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

  // Memoize the layout component and config based on mobile state
  const layoutComponent = useMemo(() => {
    if (isMobile) {
     const fidgetIds = Object.keys(config.fidgetInstanceDatums || {}).sort((a, b) => {
  const aOrder = config.fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
  const bOrder = config.fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
  return aOrder - bOrder;
});
console.log('🔄 Space.tsx layoutComponent - sorted fidgetIds:', fidgetIds.map(id => ({
  id,
  mobileOrder: config.fidgetInstanceDatums[id]?.config?.settings?.mobileOrder
})));
      
      return {
        Component: MobileViewSimplified,
        config: {
          layout: fidgetIds,
          layoutFidget: "tabFullScreen",
        }
      };
    } else {
      const layoutFidgetKey =
        config?.layoutDetails?.layoutFidget &&
          LayoutFidgets[config.layoutDetails.layoutFidget]
          ? config.layoutDetails.layoutFidget
          : "grid";
      return {
        Component: DesktopView,
        config: config?.layoutDetails?.layoutConfig ?? {
          layout: [],
          layoutFidget: "grid",
        },
        layoutFidgetKey
      };
    }
  }, [
    isMobile,
    config?.layoutDetails?.layoutFidget,
    config?.layoutDetails?.layoutConfig,
    config?.fidgetInstanceDatums,
  ]);

  const { Component: _LayoutComponent } = layoutComponent;

  if (!_LayoutComponent) {
    console.error("LayoutComponent is undefined");
  }

  const mainContent = (
    <div className="flex flex-col h-full overflow-y-auto md:overflow-y-visible touch-auto">
      <div style={{ position: "absolute", top: 0, left: 0, width: '100%' }}  className="z-level-4">
        <InfoToast />
      </div>
      {!isUndefined(profile) ? (
        <div className={`z-level-5 bg-white ${isMobile ? "flex-shrink-0" : "md:h-40 flex-shrink-0"}`} style={{ zIndex: 20, position: 'relative' }}>{profile}</div>
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

      <div className={isMobile ? "w-full h-full flex-grow relative" : "flex h-full flex-grow touch-auto"}>
        {!isUndefined(feed) && !isMobile ? (
          <div className="w-6/12 h-[calc(100vh-64px)] flex-shrink-0 overflow-y-auto touch-auto">{feed}</div>
        ) : null}

        <div className={isMobile ? "w-full h-full flex-grow relative" : "grow touch-auto"}>

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
                theme={config.theme}
                fidgetInstanceDatums={config.fidgetInstanceDatums}
                fidgetTrayContents={config.fidgetTrayContents}
                saveConfig={saveLocalConfig}
                inEditMode={!viewportMobile && editMode}
                saveExitEditMode={saveExitEditMode}
                cancelExitEditMode={cancelExitEditMode}
                portalRef={portalRef}
                hasProfile={!isNil(profile)}
                hasFeed={!isNil(feed)}
                feed={feed}
                tabNames={config.tabNames}
                fid={config.fid}
               layoutFidgetIds={Object.keys(config.fidgetInstanceDatums || {}).sort((a, b) => {
                const aOrder = config.fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
                const bOrder = config.fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
                return aOrder - bOrder;
              })}
                isHomebasePath={isHomebasePath}
              />
            ) : (
              <DesktopView
                layoutConfig={layoutComponent.config}
                layoutFidgetKey={layoutComponent.layoutFidgetKey}
                theme={config.theme}
                fidgetInstanceDatums={config.fidgetInstanceDatums}
                fidgetTrayContents={config.fidgetTrayContents}
                saveConfig={saveLocalConfig}
                inEditMode={!viewportMobile && editMode}
                saveExitEditMode={saveExitEditMode}
                cancelExitEditMode={cancelExitEditMode}
                portalRef={portalRef}
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
              saveFidgetInstanceDatums={(datums) => saveLocalConfig({ fidgetInstanceDatums: datums })}
              layoutConfig={layoutComponent.config}
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
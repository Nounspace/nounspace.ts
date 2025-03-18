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
import { LayoutFidgets } from "@/fidgets";
import { UserTheme } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { isNil, isUndefined } from "lodash";
import InfoToast from "@/common/components/organisms/InfoBanner";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import SpaceLoading from "./SpaceLoading";
import { useIsMobile } from "@/common/lib/hooks/useIsMobile";

export type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>
  fidgetType: string
  id: string
}

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
  layoutDetails?: Partial<LayoutFidgetDetails<LayoutFidgetConfig<any>>>
}

type SpaceArgs = {
  config: SpaceConfig
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>
  commitConfig: () => Promise<void>
  resetConfig: () => Promise<void>
  tabBar: ReactNode
  profile?: ReactNode
  feed?: ReactNode
  setEditMode: (v: boolean) => void
  editMode: boolean
  setSidebarEditable: (v: boolean) => void
  portalRef: React.RefObject<HTMLDivElement>
}

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
    console.log("[SPACE] Setting sidebar editable:", config.isEditable)
    setSidebarEditable(config.isEditable)
  }, [config.isEditable])

  function saveExitEditMode() {
    console.log("[SPACE] Saving and exiting edit mode")
    commitConfig()
    setEditMode(false)
  }

  function cancelExitEditMode() {
    console.log("[SPACE] Canceling and exiting edit mode")
    resetConfig()
    setEditMode(false)
  }

  async function saveLocalConfig({
    theme,
    layoutConfig,
    fidgetInstanceDatums,
    fidgetTrayContents,
  }: Partial<LayoutFidgetSaveableConfig<LayoutFidgetConfig<any>>>) {
    console.log("[SPACE] Saving local config")
    console.log("[SPACE] Theme updates:", theme ? "Yes" : "No")
    console.log("[SPACE] Layout config updates:", layoutConfig ? "Yes" : "No")
    console.log(
      "[SPACE] Fidget data updates:",
      fidgetInstanceDatums ? "Yes" : "No"
    )
    console.log(
      "[SPACE] Fidget tray updates:",
      fidgetTrayContents ? "Yes" : "No"
    )

    return saveConfig({
      layoutDetails: layoutConfig
        ? {
            layoutConfig,
          }
        : undefined,
      theme,
      fidgetInstanceDatums,
      fidgetTrayContents,
    })
  }

  // Memoize the LayoutFidget component selection based on mobile state
  const LayoutFidget = useMemo(() => {
    if (isMobile) {
      // Use TabFullScreen for mobile
      return LayoutFidgets["tabFullScreen"];
    } else {
      // Use the configured layout for desktop
      return config && config.layoutDetails && config.layoutDetails.layoutFidget
        ? LayoutFidgets[config.layoutDetails.layoutFidget]
        : LayoutFidgets["grid"];
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
      return config?.layoutDetails?.layoutConfig ?? {
        layout: [],
        layoutFidget: "grid",
      };
    }
  }, [isMobile, config?.layoutDetails?.layoutConfig, config?.fidgetInstanceDatums]);

  // Memoize the LayoutFidget render props that don't change during fidget movement
  const layoutFidgetProps = useMemo(() => {
    return {
      theme: config.theme,
      fidgetInstanceDatums: config.fidgetInstanceDatums,
      fidgetTrayContents: config.fidgetTrayContents,
      inEditMode: !isMobile && editMode, // No edit mode on mobile
      saveExitEditMode: saveExitEditMode,
      cancelExitEditMode: cancelExitEditMode,
      portalRef: portalRef,
      saveConfig: saveLocalConfig,
      hasProfile: !isMobile && !isNil(profile),
      hasFeed: !isNil(feed),
      tabNames: config.tabNames,
      fid: config.fid
    };
  }, [
    config.theme,
    config.fidgetInstanceDatums, 
    config.fidgetTrayContents,
    config.tabNames,
    config.fid,
    isMobile, 
    editMode, 
    portalRef, 
    profile, 
    feed
  ]);

  return (
    <div className="user-theme-background w-full h-full relative flex-col">
      {/* [SPACE] Rendering component structure */}
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
                <LayoutFidget
                  layoutConfig={{ ...layoutConfig }}
                  {...layoutFidgetProps}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

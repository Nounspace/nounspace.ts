"use client"
import React, { ReactNode, useEffect, useState } from "react"
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
  LayoutFidgetSavableConfig as LayoutFidgetSaveableConfig,
} from "@/common/fidgets"
import { LayoutFidgets } from "@/fidgets"
import { UserTheme } from "@/common/lib/theme"
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground"
import { isNil, isUndefined } from "lodash"
import InfoToast from "../organisms/InfoBanner"
import { useIsMobile } from "@/common/lib/hooks/useIsMobile"

// Mobile breakpoint (in pixels)
const MOBILE_BREAKPOINT = 768

export type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>
  fidgetType: string
  id: string
}

export type SpaceConfig = {
  fidgetInstanceDatums: {
    [key: string]: FidgetInstanceData
  }
  layoutID: string
  layoutDetails: LayoutFidgetDetails<LayoutFidgetConfig<any>>
  isEditable: boolean
  fidgetTrayContents: FidgetInstanceData[]
  theme: UserTheme
  timestamp?: string
  tabNames?: string[]
  fid?: number
}

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
  console.log("[SPACE] Component rendering with config:", config)
  console.log("[SPACE] Edit mode:", editMode)
  console.log("[SPACE] Has profile:", !isUndefined(profile))
  console.log("[SPACE] Has feed:", !isUndefined(feed))
  
  // Use the useIsMobile hook instead of duplicating logic
  const isMobile = useIsMobile()
  
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
  
  // Determine which layout fidget to use
  // Use TabFullScreen for mobile, otherwise use the configured layout
  let LayoutFidget
  let finalLayoutConfig

  if (isMobile) {
    // Use TabFullScreen for mobile
    LayoutFidget = LayoutFidgets["tabFullScreen"]
    
    // Extract fidget IDs from the current config to use in TabFullScreen
    const fidgetIds = Object.keys(config.fidgetInstanceDatums || {})
    
    // Create a layout config for TabFullScreen with all available fidget IDs
    finalLayoutConfig = {
      layout: fidgetIds,
    }
    
    console.log("[SPACE] Using mobile TabFullScreen layout with", fidgetIds.length, "fidgets")
  } else {
    // Use the configured layout for desktop
    LayoutFidget =
      config && config.layoutDetails && config.layoutDetails.layoutFidget
        ? LayoutFidgets[config.layoutDetails.layoutFidget]
        : LayoutFidgets["grid"]
    
    finalLayoutConfig = config?.layoutDetails?.layoutConfig ?? {
      layout: [],
    }
    
    console.log(
      "[SPACE] Using desktop layout:",
      config?.layoutDetails?.layoutFidget || "grid"
    )
  }

  console.log("[SPACE] Available layout fidgets:", Object.keys(LayoutFidgets))
  console.log("[SPACE] Layout config:", finalLayoutConfig)
  console.log(
    "[SPACE] Number of fidget instances:",
    Object.keys(config.fidgetInstanceDatums || {}).length
  )

  if (config.fidgetInstanceDatums) {
    console.log(
      "[SPACE] Fidget types:",
      Object.values(config.fidgetInstanceDatums).map((f) => f.fidgetType)
    )
  }

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
            <div className="z-50 bg-white md:h-40">
              {/* [SPACE] Rendering profile section (desktop only) */}
              {profile}
            </div>
          ) : null}
          {/* [SPACE] Rendering tab bar */}
          {tabBar}
          <div className="flex h-full">
            {!isMobile && !isUndefined(feed) ? (
              <div className="w-6/12 h-[calc(100vh-64px)]">
                {/* [SPACE] Rendering feed section (desktop only) */}
                {feed}
              </div>
            ) : null}
            <div className={isMobile ? "w-full h-full" : "grow"}>
              {/* [SPACE] Rendering layout fidget */}
              <LayoutFidget
                layoutConfig={finalLayoutConfig}
                fidgetInstanceDatums={config.fidgetInstanceDatums}
                theme={config.theme}
                fidgetTrayContents={config.fidgetTrayContents}
                inEditMode={!isMobile && editMode} // No edit mode on mobile
                saveExitEditMode={saveExitEditMode}
                cancelExitEditMode={cancelExitEditMode}
                portalRef={portalRef}
                saveConfig={saveLocalConfig}
                hasProfile={!isMobile && !isNil(profile)}
                hasFeed={!isMobile && !isNil(feed)}
                tabNames={config.tabNames}
                fid={config.fid}
              />
              {/* [SPACE] Layout fidget rendered */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

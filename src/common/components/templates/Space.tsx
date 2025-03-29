"use client"

import React, { ReactNode, useEffect } from "react"
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
  // Use the useIsMobile hook instead of duplicating logic
  const isMobile = useIsMobile()
  
  useEffect(() => {
    setSidebarEditable(config.isEditable)
  }, [config.isEditable])

  function saveExitEditMode() {
    commitConfig()
    setEditMode(false)
  }

  function cancelExitEditMode() {
    resetConfig()
    setEditMode(false)
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
  } else {
    // Use the configured layout for desktop
    LayoutFidget =
      config && config.layoutDetails && config.layoutDetails.layoutFidget
        ? LayoutFidgets[config.layoutDetails.layoutFidget]
        : LayoutFidgets["grid"]
    
    finalLayoutConfig = config?.layoutDetails?.layoutConfig ?? {
      layout: [],
    }
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
            <div className="z-50 bg-white md:h-40">
              {profile}
            </div>
          ) : null}
          <div className="relative">
            {tabBar}
            {/* Gradient overlay for tabs on mobile */}
            {isMobile && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none opacity-90 z-50"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 1) 100%)'
                }}
              />
            )}
          </div>
          <div className="flex h-full">
            {!isMobile && !isUndefined(feed) ? (
              <div className="w-6/12 h-[calc(100vh-64px)]">
                {feed}
              </div>
            ) : null}
            <div className={isMobile ? "w-full h-full" : "grow"}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

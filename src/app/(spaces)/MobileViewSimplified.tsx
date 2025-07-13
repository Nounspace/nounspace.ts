import {
    FidgetInstanceData,
} from "@/common/fidgets"
import { UserTheme } from "@/common/lib/theme"
import { LayoutFidgets } from "@/fidgets"
import React, { useMemo } from "react"

type MobileViewSimplifiedProps = {
  theme: UserTheme
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData }
  fidgetTrayContents: FidgetInstanceData[]
  saveConfig: (config: any) => Promise<void>
  inEditMode: boolean
  saveExitEditMode: () => void
  cancelExitEditMode: () => void
  portalRef: React.RefObject<HTMLDivElement>
  hasProfile: boolean
  hasFeed: boolean
  feed?: React.ReactNode
  tabNames?: string[]
  fid?: number
  layoutFidgetIds: string[]
 
  isHomebasePath?: boolean
}
const MobileViewSimplified: React.FC<MobileViewSimplifiedProps> = ({
  theme,
  fidgetInstanceDatums,
  fidgetTrayContents,
  saveConfig,
  inEditMode,
  saveExitEditMode,
  cancelExitEditMode,
  portalRef,
  hasProfile,
  hasFeed,
  feed,
  tabNames,
  fid,
  layoutFidgetIds,

  isHomebasePath = false,
}) => {
  const LayoutFidget = useMemo(() => LayoutFidgets["tabFullScreen"], []);

  const layoutConfig = useMemo(() => {
   let layout = [...layoutFidgetIds];
    
   
    
    if (isHomebasePath && hasFeed && !layout.includes("feed")) {
      layout = ["feed", ...layout];
    }
    
    return {
      layout,
      layoutFidget: "tabFullScreen",
    };
  }, [layoutFidgetIds, isHomebasePath, hasFeed]);

  if (layoutConfig.layout.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium mb-2">No fidgets available</h3>
          <p className="text-sm text-gray-400">Add some fidgets to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <LayoutFidget
        layoutConfig={layoutConfig}
        theme={theme}
        fidgetInstanceDatums={fidgetInstanceDatums}
        fidgetTrayContents={fidgetTrayContents}
        saveConfig={saveConfig}
        inEditMode={inEditMode}
        saveExitEditMode={saveExitEditMode}
        cancelExitEditMode={cancelExitEditMode}
        portalRef={portalRef}
        hasProfile={hasProfile}
        hasFeed={hasFeed}
        feed={feed}
        tabNames={tabNames}
        fid={fid}
        isHomebasePath={isHomebasePath}
      />
    </div>
  );
};

export default MobileViewSimplified;
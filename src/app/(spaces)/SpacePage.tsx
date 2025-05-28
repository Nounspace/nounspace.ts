import React, { ReactNode, Suspense } from "react";
import Space, { SpaceConfig, SpaceConfigSaveDetails } from "./Space";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

export type SpacePageArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  tabBar: ReactNode;
  profile?: ReactNode;
  feed?: ReactNode;
};

export default function SpacePage({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  tabBar,
  profile,
  feed,
}: SpacePageArgs) {
  const {
    editMode,
    setEditMode,
    setSidebarEditable,
    portalRef,
    mobilePreview,
  } = useSidebarContext();

  const spaceElement = (
    <Space
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={profile}
      feed={feed}
      setEditMode={setEditMode}
      editMode={editMode}
      setSidebarEditable={setSidebarEditable}
      portalRef={portalRef}
    />
  );

  return mobilePreview ? (
    <div className="flex items-center justify-center w-full h-full flex-1">
      <div className="w-[390px] h-[844px] border overflow-hidden relative">
        {spaceElement}
      </div>
    </div>
  ) : (
    <>{spaceElement}</>
  );
}

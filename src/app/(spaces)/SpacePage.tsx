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
// test
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
    previewConfig,
    isPreviewMode,
  } = useSidebarContext();

  // Use preview config when in preview mode, otherwise use the original config
  const activeConfig = isPreviewMode && previewConfig ? previewConfig : config;

  return (
    <>
      <Space
        config={activeConfig}
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
    </>
  );
}

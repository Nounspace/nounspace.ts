import React, { ReactNode } from "react";
import Space, { SpaceConfig, SpaceConfigSaveDetails } from "./Space";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";

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
  const { editMode, setEditMode, setSidebarEditable, portalRef } =
    useSidebarContext();
  const { forceMobile } = useMobilePreview();

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

  return (
    editMode && forceMobile ? (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-[390px] h-[844px] overflow-hidden">
          {spaceElement}
        </div>
      </div>
    ) : (
      spaceElement
    )
  );
}

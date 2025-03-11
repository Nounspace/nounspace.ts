import React, { ReactNode, Suspense } from "react";
import Space, { SpaceConfig, SpaceConfigSaveDetails } from "./Space";
import { isUndefined } from "lodash";
import SpaceLoading from "@/app/(spaces)/SpaceLoading";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

export type SpacePageArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  tabBar: ReactNode;
  profile?: ReactNode;
  feed?: ReactNode;
  loading?: boolean;
};

export default function SpacePage({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  tabBar,
  profile,
  loading,
  feed,
}: SpacePageArgs) {
  const { editMode, setEditMode, setSidebarEditable, portalRef } =
    useSidebarContext();

  return (
    <>
      <Suspense fallback={<SpaceLoading hasProfile={!isUndefined(profile)} />}>
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
      </Suspense>
    </>
  );
}

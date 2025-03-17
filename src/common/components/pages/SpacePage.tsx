import React, { ReactNode } from "react";
import Space, { SpaceConfig, SpaceConfigSaveDetails } from "../templates/Space";
import { isUndefined } from "lodash";
import SpaceLoading from "@/common/components/templates/SpaceLoading";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

import FrameV2Fidget from "@/fidgets/framesv2/framev2";

export type SpacePageArgs = {
  config?: SpaceConfig;
  saveConfig?: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig?: () => Promise<void>;
  resetConfig?: () => Promise<void>;
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
      {isUndefined(config) ||
        isUndefined(saveConfig) ||
        isUndefined(commitConfig) ||
        isUndefined(resetConfig) ||
        loading ? (
        <SpaceLoading profile={profile} tabBar={tabBar} inEditMode={editMode} />
      ) : (
        <FrameV2Fidget searchParams={{ 
          url: "https://f.bracket.game/", 
          specification:"farcaster_v2", 
          actions:"true" 
          }} />

        // <Space
        //   config={config}
        //   saveConfig={saveConfig}
        //   commitConfig={commitConfig}
        //   resetConfig={resetConfig}
        //   tabBar={tabBar}
        //   profile={profile}
        //   feed={feed}
        //   setEditMode={setEditMode}
        //   editMode={editMode}
        //   setSidebarEditable={setSidebarEditable}
        //   portalRef={portalRef}
        // />
      )}
    </>
  );
}

import React, { ReactNode, useRef, useState } from "react";
import Sidebar from "../organisms/Sidebar";
import Space, { SpaceConfig } from "../templates/Space";
import { isUndefined } from "lodash";
import SpaceLoading from "../templates/SpaceLoading";

type SpacePageArgs = {
  config?: SpaceConfig;
  saveConfig?: (config: SpaceConfig) => Promise<void>;
  commitConfig?: () => Promise<void>;
  resetConfig?: () => Promise<void>;
  profile?: ReactNode;
  loading?: boolean;
};

export default function SpacePage({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  profile,
  loading,
}: SpacePageArgs) {
  const [editMode, setEditMode] = useState(false);
  const [sidebarEditable, setSidebarEditable] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  function enterEditMode() {
    setEditMode(true);
  }

  return (
    <div
      className="flex w-full h-full"
      style={{ background: "var(--user-theme-background)" }}
    >
      <div className="flex mx-auto transition-all duration-100 ease-out z-10">
        <Sidebar
          editMode={editMode}
          enterEditMode={enterEditMode}
          isEditable={sidebarEditable}
          portalRef={portalRef}
          theme={config?.theme}
        />
      </div>
      {isUndefined(config) ||
      isUndefined(saveConfig) ||
      isUndefined(commitConfig) ||
      isUndefined(resetConfig) ||
      loading ? (
        <SpaceLoading />
      ) : (
        <Space
          config={config}
          saveConfig={saveConfig}
          commitConfig={commitConfig}
          resetConfig={resetConfig}
          profile={profile}
          setEditMode={setEditMode}
          editMode={editMode}
          setSidebarEditable={setSidebarEditable}
          portalRef={portalRef}
        />
      )}
    </div>
  );
}

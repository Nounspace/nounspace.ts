import React, { ReactNode, useRef, useEffect } from "react";
import Space, { SpaceConfig, SpaceConfigSaveDetails } from "./Space";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

export type SpacePageArgs = {
  config: SpaceConfig | undefined;
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  tabBar: ReactNode;
  profile?: ReactNode;
  feed?: ReactNode;
  /** When true, render the feed on mobile layouts. */
  showFeedOnMobile?: boolean;
};

export default function SpacePage({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  tabBar,
  profile,
  feed,
  showFeedOnMobile,
}: SpacePageArgs) {
  
  // Create a stable deferred promise that won't change across renders
  const deferredRef = useRef<{
    promise: Promise<void>;
    resolve: () => void;
  } | null>(null);

  // Initialize the deferred promise once
  if (!deferredRef.current) {
    let resolve: () => void;
    const promise = new Promise<void>((res) => {
      resolve = res;
    });
    deferredRef.current = {
      promise,
      resolve: resolve!,
    };
  }

  // Watch for config becoming defined and resolve the deferred
  useEffect(() => {
    if (config && deferredRef.current) {
      deferredRef.current.resolve();
    }
  }, [config]);

  // If config is undefined, throw the stable promise to trigger Suspense fallback
  if (!config) {
    throw deferredRef.current.promise;
  }
  
  const { editMode, setEditMode, setSidebarEditable, portalRef } =
    useSidebarContext();

  return (
    <>
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
    </>
  );
}

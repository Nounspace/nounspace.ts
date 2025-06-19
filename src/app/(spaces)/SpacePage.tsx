import React, { ReactNode, Suspense, useMemo, useCallback } from "react";
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
    editWithAiMode,
    setSidebarEditable,
    portalRef,
    previewConfig,
    setPreviewConfig,
    isPreviewMode,
  } = useSidebarContext();

  // Use preview config when in preview mode, otherwise use the original config
  // But preserve editability from the original config
  const activeConfig = useMemo(() => {
    if (isPreviewMode && previewConfig) {
      return {
        ...previewConfig,
        // Preserve editability from original config
        isEditable: config.isEditable,
      };
    }
    return config;
  }, [isPreviewMode, previewConfig, config]);

  // Custom saveConfig that handles preview mode properly
  const handleSaveConfig = useCallback(async (configDetails: SpaceConfigSaveDetails) => {
    if (isPreviewMode && previewConfig) {
      // If we're in preview mode, update the preview config with the manual changes
      const updatedPreviewConfig = { ...previewConfig };
      
      // Apply the changes to the preview config
      if (configDetails.fidgetInstanceDatums) {
        updatedPreviewConfig.fidgetInstanceDatums = configDetails.fidgetInstanceDatums;
      }
      if (configDetails.fidgetTrayContents) {
        updatedPreviewConfig.fidgetTrayContents = configDetails.fidgetTrayContents;
      }
      if (configDetails.layoutDetails) {
        updatedPreviewConfig.layoutDetails = {
          ...updatedPreviewConfig.layoutDetails,
          ...configDetails.layoutDetails,
        };
      }
      if (configDetails.theme) {
        updatedPreviewConfig.theme = configDetails.theme;
      }
      
      // Update the preview config with manual changes
      setPreviewConfig(updatedPreviewConfig);
      console.log("🔄 Updated preview config with manual changes:", configDetails);
    } else {
      // Normal save flow when not in preview mode
      await saveConfig(configDetails);
    }
  }, [isPreviewMode, previewConfig, saveConfig, setPreviewConfig]);

  // Custom commitConfig that properly handles preview mode
  const handleCommitConfig = useCallback(async () => {
    if (isPreviewMode && previewConfig) {
      // If we're in preview mode, we need to save the preview config as the new config
      console.log("💾 Committing preview config as final config");
      await saveConfig({
        fidgetInstanceDatums: previewConfig.fidgetInstanceDatums,
        fidgetTrayContents: previewConfig.fidgetTrayContents,
        layoutDetails: previewConfig.layoutDetails,
        theme: previewConfig.theme,
      });
    } else {
      // Normal commit flow
      await commitConfig();
    }
  }, [isPreviewMode, previewConfig, saveConfig, commitConfig]);

  return (
    <>
      <Space
        config={activeConfig}
        saveConfig={handleSaveConfig}
        commitConfig={handleCommitConfig}
        resetConfig={resetConfig}
        tabBar={tabBar}
        profile={profile}
        feed={feed}
        setEditMode={setEditMode}
        editMode={editMode}
        editWithAiMode={editWithAiMode}
        setSidebarEditable={setSidebarEditable}
        portalRef={portalRef}
      />
    </>
  );
}

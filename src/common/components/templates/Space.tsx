import React, { ReactNode, useEffect } from "react";
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
  LayoutFidgetSavableConfig as LayoutFidgetSaveableConfig,
} from "@/common/fidgets";
import { LayoutFidgets } from "@/fidgets";
import { UserTheme } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { isNil, isUndefined } from "lodash";
import InfoToast from "../organisms/InfoBanner";

export type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>;
  fidgetType: string;
  id: string;
};

export type SpaceConfig = {
  fidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails<LayoutFidgetConfig<any>>;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
  theme: UserTheme;
  timestamp?: string;
};

export type SpaceConfigSaveDetails = Partial<
  Omit<SpaceConfig, "layoutDetails">
> & {
  layoutDetails?: Partial<LayoutFidgetDetails<LayoutFidgetConfig<any>>>;
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  profile?: ReactNode;
  feed?: ReactNode;
  setEditMode: (v: boolean) => void;
  editMode: boolean;
  setSidebarEditable: (v: boolean) => void;
  portalRef: React.RefObject<HTMLDivElement>;
};

export default function Space({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  profile,
  feed,
  setEditMode,
  editMode,
  setSidebarEditable,
  portalRef,
}: SpaceArgs) {
  useEffect(() => {
    setSidebarEditable(config.isEditable);
  }, [config.isEditable]);

  function saveExitEditMode() {
    commitConfig();
    setEditMode(false);
  }

  function cancelExitEditMode() {
    resetConfig();
    setEditMode(false);
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
    });
  }

  const LayoutFidget =
    config && config.layoutDetails && config.layoutDetails.layoutFidget
      ? LayoutFidgets[config.layoutDetails.layoutFidget]
      : LayoutFidgets["grid"];

  const layoutConfig = config?.layoutDetails?.layoutConfig ?? {
    layout: [],
    layoutFidget: "grid",
  };

  return (
    <div className="user-theme-background w-full h-full relative">
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
      <div className="w-full transition-all duration-100 ease-out h-full">
        <div className="h-full flex flex-col">
          <div style={{ position: "fixed", zIndex: 9999 }}>
            <InfoToast />
          </div>
          {!isUndefined(profile) ? (
            <div className="z-50 bg-white h-40">{profile}</div>
          ) : null}
          {/* add feed here and have it take up half of the space */}
          <LayoutFidget
            layoutConfig={{ ...layoutConfig }}
            fidgetInstanceDatums={config.fidgetInstanceDatums}
            theme={config.theme}
            fidgetTrayContents={config.fidgetTrayContents}
            inEditMode={editMode}
            saveExitEditMode={saveExitEditMode}
            cancelExitEditMode={cancelExitEditMode}
            portalRef={portalRef}
            saveConfig={saveLocalConfig}
            hasProfile={!isNil(profile)}
            hasFeed={!isNil(feed)}
          />
        </div>
      </div>
    </div>
  );
}

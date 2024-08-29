import React, { ReactNode, useEffect, useMemo } from "react";
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
import TabBar from "../organisms/TabBar";

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
  fid?: number;
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
  fid,
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
      { isNil(profile) &&
      <TabBar
        hasProfile={!isNil(profile)}
        inEditMode={editMode}
        profileFid={fid ? fid : 0}
      />
       }
      <div className="w-full transition-all duration-100 ease-out">
        <div className="flex flex-col">
          <div style={{ position: "fixed", zIndex: 9999 }}>
            <InfoToast />
          </div>
          {!isUndefined(profile) ? (
            <div className="z-50 bg-white h-40">{profile}</div>
          ) : null}
          <div className="flex">
            {!isUndefined(feed) ? <div className="w-6/12">{feed}</div> : null}
            <div className={isUndefined(feed) ? "grow" : "grow"}>
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
      </div>
    </div>
  );
}

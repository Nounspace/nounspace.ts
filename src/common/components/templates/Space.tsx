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

  return (
    <>
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
      <div
        className={
          editMode
            ? "w-full transition-all duration-100 ease-out h-full"
            : "w-full transition-all duration-100 ease-out h-full"
        }
      >
        <div className="h-full flex flex-col">
          {!isUndefined(profile) ? (
            <div className="z-50 bg-white h-40">{profile}</div>
          ) : null}
          <LayoutFidget
            layoutConfig={{
              ...config.layoutDetails.layoutConfig,
            }}
            fidgetInstanceDatums={config.fidgetInstanceDatums}
            theme={config.theme}
            fidgetTrayContents={config.fidgetTrayContents}
            inEditMode={editMode}
            saveExitEditMode={saveExitEditMode}
            cancelExitEditMode={cancelExitEditMode}
            portalRef={portalRef}
            saveConfig={saveLocalConfig}
            hasProfile={!isNil(profile)}
          />
        </div>
      </div>
    </>
  );
}

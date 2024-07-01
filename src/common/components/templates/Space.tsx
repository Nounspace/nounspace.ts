import React, { useState, useRef, ReactNode } from "react";
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
import Sidebar from "../organisms/Sidebar";
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

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
  profile?: ReactNode;
};

export default function Space({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
  profile,
}: SpaceArgs) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);

  function enterEditMode() {
    setEditMode(true);
  }

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
  }: LayoutFidgetSaveableConfig<LayoutFidgetConfig<any>>) {
    return saveConfig({
      ...config,
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig,
      },
      theme,
      fidgetInstanceDatums,
      fidgetTrayContents,
    });
  }

  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];

  return (
    <>
      <CustomHTMLBackground html={config.theme?.properties.backgroundHTML} />
      <div
        className="flex w-full h-full"
        style={{ background: "var(--user-theme-background)" }}
      >
        <div className="flex mx-auto transition-all duration-100 ease-out">
          <Sidebar
            editMode={editMode}
            enterEditMode={enterEditMode}
            isEditable={config.isEditable}
            portalRef={portalRef}
          />
        </div>
        <div
          className={
            editMode
              ? "w-full transition-all duration-100 ease-out h-full"
              : "w-full transition-all duration-100 ease-out h-full"
          }
        >
          <div className="h-full flex flex-col">
            {!isUndefined(profile) ? <div> {profile} </div> : null}
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
      </div>
    </>
  );
}

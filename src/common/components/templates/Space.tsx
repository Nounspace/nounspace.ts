import React, { useState, useRef } from "react";
import {
  FidgetConfig,
  FidgetInstanceData,
  FidgetSettings,
  LayoutFidgetDetails,
  LayoutFidgetSavableConfig as LayoutFidgetSaveableConfig,
} from "@/common/fidgets";
import { LayoutFidgets } from "@/fidgets";
import { UserTheme } from "@/common/lib/theme";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import Sidebar from "../organisms/Sidebar";

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
  layoutDetails: LayoutFidgetDetails;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
  theme: UserTheme;
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
  commitConfig: () => Promise<void>;
  resetConfig: () => Promise<void>;
};

export default function Space({
  config,
  saveConfig,
  commitConfig,
  resetConfig,
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

  function cancleExitEditMode() {
    resetConfig();
    setEditMode(false);
  }

  async function saveLocalConfig({
    theme,
    layoutConfig,
    fidgetInstanceDatums,
    fidgetTrayContents,
  }: LayoutFidgetSaveableConfig) {
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
      <div className="flex w-full h-full">
        <div
          className={
            editMode
              ? "w-4/12 flex mx-auto transition-all duration-100 ease-out max-w-96"
              : "w-3/12 flex mx-auto transition-all duration-100 ease-out max-w-96"
          }
        >
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
              : "w-9/12 transition-all duration-100 ease-out h-full"
          }
        >
          <div className={"h-full flex flex-col"}>
            <LayoutFidget
              layoutConfig={{
                ...config.layoutDetails.layoutConfig,
              }}
              fidgetInstanceDatums={config.fidgetInstanceDatums}
              theme={config.theme}
              fidgetTrayContents={config.fidgetTrayContents}
              inEditMode={editMode}
              saveExitEditMode={saveExitEditMode}
              cancelExitEditMode={cancleExitEditMode}
              portalRef={portalRef}
              saveConfig={saveLocalConfig}
            />
          </div>
        </div>
      </div>
    </>
  );
}

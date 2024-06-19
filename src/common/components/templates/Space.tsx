import React, { useState } from "react";
import {
  FidgetConfig,
  FidgetSettings,
  LayoutFidgetConfig,
  LayoutFidgetDetails,
} from "@/common/fidgets";
import { CompleteFidgets, LayoutFidgets } from "@/fidgets";
import { mapValues } from "lodash";
import { FidgetWrapper } from "@/common/fidgets/FidgetWrapper";
import { ThemeSettings } from "@/common/lib/theme";
import Sidebar from "../organisms/Sidebar";

type SpaceFidgetConfig = {
  instanceConfig: FidgetConfig<FidgetSettings>;
  fidgetType: string;
  id: string;
};

export type SpaceConfig = {
  fidgetConfigs: {
    [key: string]: SpaceFidgetConfig;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeSettings;
  isEditable: boolean;
  fidgetTray: SpaceFidgetConfig[];
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
};

export default function Space({ config, saveConfig }: SpaceArgs) {
  const [editMode, setEditMode] = useState(false);
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentFidgetSettings, setcurrentFidgetSettings] =
    useState<React.ReactNode>(<></>);

  function unselect() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }

  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];
  const fidgets = mapValues(config.fidgetConfigs, (details, key) =>
    FidgetWrapper({
      fidget: CompleteFidgets[details.fidgetType].fidget,
      config: {
        id: details.id,
        instanceConfig: {
          editable: editMode,
          settings: details.instanceConfig.settings,
          data: details.instanceConfig.data,
        },
        editConfig: CompleteFidgets[details.fidgetType].editConfig,
      },
      context: {
        theme: config.theme,
      },
      saveConfig: async (newInstanceConfig: FidgetConfig<FidgetSettings>) => {
        return await saveConfig({
          ...config,
          fidgetConfigs: {
            ...config.fidgetConfigs,
            [key]: {
              instanceConfig: newInstanceConfig,
              id: details.id,
              fidgetType: details.fidgetType,
            },
          },
        });
      },
      setcurrentFidgetSettings: setcurrentFidgetSettings,
      setSelectedFidgetID: setSelectedFidgetID,
      selectedFidgetID: selectedFidgetID,
    }),
  );

  function saveLayout(layout: LayoutFidgetConfig) {
    return saveConfig({
      ...config,
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig: {
          ...config.layoutDetails.layoutConfig,
          layout: layout,
        },
      },
    });
  }

  function saveTheme(newTheme) {
    return saveConfig({
      ...config,
      theme: newTheme,
    });
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 h-screen w-screen bg-transparent"
        onClick={unselect}
      ></div>
      <div className="flex">
        <div
          className={
            editMode
              ? "w-4/12 flex mx-auto transition-all duration-100 ease-out"
              : "w-3/12 flex mx-auto transition-all duration-100 ease-out"
          }
        >
          <Sidebar
            editMode={editMode}
            setEditMode={setEditMode}
            theme={config.theme}
            saveTheme={saveTheme}
            isEditable={config.isEditable}
            unselect={unselect}
            selectedFidgetID={selectedFidgetID}
            currentFidgetSettings={currentFidgetSettings}
          />
        </div>

        <div
          className={
            editMode
              ? "w-8/12 transition-all duration-100 ease-out"
              : "w-9/12 transition-all duration-100 ease-out"
          }
        >
          <LayoutFidget
            layoutConfig={{
              ...config.layoutDetails.layoutConfig,
              onLayoutChange: saveLayout,
            }}
            fidgets={fidgets}
            inEditMode={editMode}
          />
        </div>
      </div>
    </>
  );
}

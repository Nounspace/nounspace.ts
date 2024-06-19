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

export type SpaceConfig = {
  fidgetConfigs: {
    [key: string]: {
      instanceConfig: FidgetConfig<FidgetSettings>;
      fidgetName: string;
      id: string;
    };
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeSettings;
  isEditable: boolean;
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
};

export default function Space({ config, saveConfig }: SpaceArgs) {
  const [editMode, setEditMode] = useState(false);
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentSettings, setCurrentSettings] = useState<React.JSX.Element>(
    <></>,
  );
  function unselect() {
    setSelectedFidgetID("");
    setCurrentSettings(<></>);
  }

  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];
  const fidgets = mapValues(config.fidgetConfigs, (details, key) =>
    FidgetWrapper({
      fidget: CompleteFidgets[details.fidgetName].fidget,
      config: {
        id: details.id,
        instanceConfig: {
          editable: editMode,
          settings: details.instanceConfig.settings,
          data: details.instanceConfig.data,
        },
        editConfig: CompleteFidgets[details.fidgetName].editConfig,
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
              fidgetName: details.fidgetName,
            },
          },
        });
      },
      setCurrentSettings: setCurrentSettings,
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
        <div className="w-3/12 flex mx-auto">
          <Sidebar
            editMode={editMode}
            setEditMode={setEditMode}
            theme={config.theme}
            saveTheme={saveTheme}
            isEditable={config.isEditable}
            selectedFidgetID={selectedFidgetID}
            currentSettings={currentSettings}
          />
        </div>

        <div className="w-9/12">
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

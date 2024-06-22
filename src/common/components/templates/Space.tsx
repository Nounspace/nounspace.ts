import React, { useState, DragEvent, useEffect } from "react";
import {
  FidgetConfig,
  FidgetInstanceData,
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
  fidgetInstances: {
    [key: string]: FidgetInstanceData;
  };
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeSettings;
  isEditable: boolean;
  fidgetTrayContents: FidgetInstanceData[];
};

type SpaceArgs = {
  config: SpaceConfig;
  saveConfig: (config: SpaceConfig) => Promise<void>;
};

export default function Space({ config, saveConfig }: SpaceArgs) {
  const [editMode, setEditMode] = useState(false);
  const [externalDraggedItem, setExternalDraggedItem] = useState<{
    w: number;
    h: number;
  }>();
  const [selectedFidgetID, setSelectedFidgetID] = useState("");
  const [currentFidgetSettings, setcurrentFidgetSettings] =
    useState<React.ReactNode>(<></>);

  function unselectFidget() {
    setSelectedFidgetID("");
    setcurrentFidgetSettings(<></>);
  }

  const LayoutFidget = LayoutFidgets[config.layoutDetails.layoutFidget];

  const fidgets = mapValues(config.fidgetInstances, (details, key) =>
    FidgetWrapper({
      fidget: CompleteFidgets[details.fidgetType].fidget,
      bundle: {
        fidgetType: details.fidgetType,
        id: details.id,
        config: {
          editable: editMode,
          settings: details.config.settings,
          data: details.config.data,
        },
        properties: CompleteFidgets[details.fidgetType].properties,
      },
      context: {
        theme: config.theme,
      },
      saveConfig: async (newInstanceConfig: FidgetConfig<FidgetSettings>) => {
        return await saveConfig({
          ...config,
          fidgetInstances: {
            ...config.fidgetInstances,
            [key]: {
              config: newInstanceConfig,
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

  function saveLayout(newLayoutConfig: LayoutFidgetConfig) {
    return saveConfig({
      ...config,
      layoutDetails: {
        ...config.layoutDetails,
        layoutConfig: {
          ...config.layoutDetails.layoutConfig,
          ...newLayoutConfig,
        },
      },
    });
  }

  function addFidget(key: string, fidgetData: FidgetInstanceData) {
    const newFidgets: { [key: string]: FidgetInstanceData } = {
      ...config.fidgetInstances,
    };

    newFidgets[key] = fidgetData;

    saveFidgets(newFidgets);
  }

  function saveFidgets(fidgetInstances: { [key: string]: FidgetInstanceData }) {
    return saveConfig({
      ...config,
      fidgetInstances: fidgetInstances,
    });
  }

  function saveTrayContents(fidgetTrayContents: FidgetInstanceData[]) {
    return saveConfig({
      ...config,
      fidgetTrayContents: fidgetTrayContents,
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
        onClick={unselectFidget}
      ></div>
      <div className="flex w-full h-full">
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
            unselect={unselectFidget}
            selectedFidgetID={selectedFidgetID}
            currentFidgetSettings={currentFidgetSettings}
            setExternalDraggedItem={setExternalDraggedItem}
            fidgetTrayContents={config.fidgetTrayContents}
            saveTrayContents={saveTrayContents}
          />
        </div>

        <div
          className={
            editMode
              ? "w-8/12 transition-all duration-100 ease-out p-8"
              : "w-9/12 transition-all duration-100 ease-out p-8"
          }
        >
          <LayoutFidget
            layoutConfig={{
              ...config.layoutDetails.layoutConfig,
              saveLayout: { saveLayout },
              addFidget: { addFidget },
              droppingItem: {
                i: "TODO: GENERATE ID",
                w: externalDraggedItem?.w,
                h: externalDraggedItem?.h,
              },
            }}
            fidgets={fidgets}
            inEditMode={editMode}
          />
        </div>
      </div>
    </>
  );
}

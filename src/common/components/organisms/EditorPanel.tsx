import React, { Dispatch, SetStateAction, useState } from "react";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetTray from "./FidgetTray";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import FidgetPicker from "./FidgetPicker";
import { v4 as uuidv4 } from "uuid";
import { fromPairs, map } from "lodash";
import { Button } from "../atoms/button";

export interface EditorPanelProps {
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentFidgetSettings: React.ReactNode;
  fidgetTrayContents: FidgetInstanceData[];
  saveTrayContents: (fidgetTrayContents: FidgetInstanceData[]) => Promise<void>;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  saveFidgetInstanceDatums(newFidgetInstanceDatums: {
    [key: string]: FidgetInstanceData;
  }): Promise<void>;
  removeFidget(fidgetId: string): void;
  isPickingFidget: boolean;
  setIsPickingFidget: React.Dispatch<React.SetStateAction<boolean>>;
  openFidgetPicker(): void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setCurrentlyDragging,
  setExternalDraggedItem,
  saveExitEditMode,
  cancelExitEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  unselect,
  selectedFidgetID,
  currentFidgetSettings,
  fidgetTrayContents,
  saveTrayContents,
  fidgetInstanceDatums,
  saveFidgetInstanceDatums,
  removeFidget,
  isPickingFidget,
  setIsPickingFidget,
  openFidgetPicker,
}) => {
  function generateFidgetInstance(
    fidget: FidgetModule<FidgetArgs>,
  ): FidgetInstanceData {
    function allFields(fidget: FidgetModule<FidgetArgs>) {
      return fromPairs(
        map(fidget.properties.fields, (field) => {
          return [field.fieldName, field.default];
        }),
      );
    }

    const newFidgetInstanceData = {
      config: {
        editable: true,
        data: {},
        settings: allFields(fidget),
      },
      fidgetType: fidget.properties.fidgetName,
      id: fidget.properties.fidgetName + ":" + uuidv4(),
    };

    return newFidgetInstanceData;
  }

  function addFidgetToTray(fidget: FidgetModule<FidgetArgs>) {
    // Generate new fidget instance
    const newFidgetInstanceData = generateFidgetInstance(fidget);

    // Add it to the instance data list
    fidgetInstanceDatums[newFidgetInstanceData.id] = newFidgetInstanceData;
    saveFidgetInstanceDatums(fidgetInstanceDatums);

    // Add it to the tray
    const newTrayContents = [...fidgetTrayContents, newFidgetInstanceData];
    saveTrayContents(newTrayContents);

    setIsPickingFidget(false);
  }

  return (
    <aside
      id="logo-sidebar"
      className="h-full flex-row flex transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex-1 min-w-64 h-full pl-8 pt-24 pb-24 flex-col flex px-4 py-4 overflow-y-hidden border-r-2">
        <div className="h-full flex-col">
          {selectedFidgetID ? (
            <>{currentFidgetSettings}</>
          ) : (
            <>
              {isPickingFidget ? (
                <FidgetPicker
                  addFidgetToTray={addFidgetToTray}
                  setCurrentlyDragging={setCurrentlyDragging}
                  setExternalDraggedItem={setExternalDraggedItem}
                  generateFidgetInstance={generateFidgetInstance}
                  setIsPickingFidget={setIsPickingFidget}
                />
              ) : (
                <ThemeSettingsEditor
                  theme={theme}
                  saveTheme={saveTheme}
                  saveExitEditMode={saveExitEditMode}
                  cancelExitEditMode={cancelExitEditMode}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-24">
        <FidgetTray
          setCurrentlyDragging={setCurrentlyDragging}
          setExternalDraggedItem={setExternalDraggedItem}
          contents={fidgetTrayContents}
          openFidgetPicker={openFidgetPicker}
          saveTrayContents={saveTrayContents}
          removeFidget={removeFidget}
        />
      </div>
    </aside>
  );
};

export default EditorPanel;

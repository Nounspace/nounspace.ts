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
}) => {
  const [isPickingFidget, setIsPickingFidget] = useState(false);

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselect();
  }

  function addFidgetToTray(fidget: FidgetModule<FidgetArgs>) {
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

    const newTrayContents = [...fidgetTrayContents, newFidgetInstanceData];

    fidgetInstanceDatums[newFidgetInstanceData.id] = newFidgetInstanceData;

    setIsPickingFidget(false);
    saveFidgetInstanceDatums(fidgetInstanceDatums);
    saveTrayContents(newTrayContents);
  }

  return (
    <div className="flex w-full">
      <aside
        id="editor-panel"
        className="pl-16 pr-8 py-40 flex-col h-10/12 z-8 w-10/12 transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Editor"
      >
        <div className="w-full h-full">
          <div className="h-full px-4 py-4 border border-blue-100 rounded-xl relative bg-card">
            <div className="flex-col h-full">
              {selectedFidgetID ? (
                <>
                  {currentFidgetSettings}
                  <Button
                    onClick={() => {
                      removeFidget(selectedFidgetID);
                    }}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  {isPickingFidget ? (
                    <FidgetPicker addFidgetToTray={addFidgetToTray} />
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
        </div>
      </aside>
      <div className="w-2/12">
        <FidgetTray
          setCurrentlyDragging={setCurrentlyDragging}
          setExternalDraggedItem={setExternalDraggedItem}
          contents={fidgetTrayContents}
          openFidgetPicker={openFidgetPicker}
          saveTrayContents={saveTrayContents}
          removeFidget={removeFidget}
        />
      </div>
    </div>
  );
};

export default EditorPanel;

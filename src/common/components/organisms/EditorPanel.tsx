import React, { Dispatch, SetStateAction, useState } from "react";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetTray from "./FidgetTray";
import {
  FidgetArgs,
  FidgetFieldConfig,
  FidgetInstanceData,
  FidgetModule,
} from "@/common/fidgets";
import FidgetPicker from "./FidgetPicker";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { mapValues } from "lodash";

export interface EditorPanelProps {
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setEditMode: (editMode: boolean) => void;
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
  removeFidgetFromGrid(fidgetId: string): void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setExternalDraggedItem,
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  unselect,
  selectedFidgetID,
  currentFidgetSettings,
  fidgetTrayContents,
  saveTrayContents,
  fidgetInstanceDatums,
  saveFidgetInstanceDatums,
  removeFidgetFromGrid,
}) => {
  const [isPickingFidget, setIsPickingFidget] = useState(false);

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselect();
  }

  function addFidgetToTray(fidget: FidgetModule<FidgetArgs>) {
    function allFields(fidget: FidgetModule<FidgetArgs>) {
      return mapValues(fidget.properties.fields, (field) => {
        return {
          fieldName: field.fieldName,
          default: field.default,
          required: field.required,
          inputSelector: field.inputSelector,
        };
      });
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
        className="flex-col h-10/12 z-8 w-7/12 transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Editor"
      >
        <div className="w-full h-full">
          <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
            <div className="flex-col h-full">
              {selectedFidgetID ? (
                <>{currentFidgetSettings}</>
              ) : (
                <>
                  {isPickingFidget ? (
                    <FidgetPicker addFidgetToTray={addFidgetToTray} />
                  ) : (
                    <ThemeSettingsEditor
                      theme={theme}
                      saveTheme={saveTheme}
                      setEditMode={setEditMode}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="w-5/12">
        <FidgetTray
          setExternalDraggedItem={setExternalDraggedItem}
          contents={fidgetTrayContents}
          openFidgetPicker={openFidgetPicker}
          saveTrayContents={saveTrayContents}
          removeFidgetFromGrid={removeFidgetFromGrid}
        />
      </div>
    </div>
  );
};

export default EditorPanel;

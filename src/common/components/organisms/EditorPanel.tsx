import React, { Dispatch, SetStateAction } from "react";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetTray from "./FidgetTray";
import { toast } from "sonner";
import {
  FidgetArgs,
  FidgetBundle,
  FidgetInstanceData,
  FidgetModule,
} from "@/common/fidgets";
import FidgetPicker from "./FidgetPicker";
import { v4 as uuidv4 } from "uuid";
import { fromPairs, map } from "lodash";
import { CompleteFidgets } from "@/fidgets";

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
  selectFidget(fidgetBundle: FidgetBundle): void;
  addFidgetToGrid(fidget: FidgetInstanceData): boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setCurrentlyDragging,
  setExternalDraggedItem,
  saveExitEditMode,
  cancelExitEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
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
  selectFidget,
  addFidgetToGrid,
}) => {
  function generateFidgetInstance(
    fidgetId: string,
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
      fidgetType: fidgetId,
      id: fidgetId + ":" + uuidv4(),
    };

    return newFidgetInstanceData;
  }

  // Add fidget to grid if space is available, otherwise add to tray
  function addFidget(fidgetId: string, fidget: FidgetModule<FidgetArgs>) {
    // Generate new fidget instance
    const newFidgetInstanceData = generateFidgetInstance(fidgetId, fidget);

    // Add it to the instance data list
    fidgetInstanceDatums[newFidgetInstanceData.id] = newFidgetInstanceData;
    saveFidgetInstanceDatums(fidgetInstanceDatums);

    setIsPickingFidget(false);

    const bundle = {
      ...newFidgetInstanceData,
      properties: CompleteFidgets[fidgetId].properties,
    };

    const addedToGrid = addFidgetToGrid(bundle);

    if (!addedToGrid) {
      toast("No space available on the grid. Fidget added to the tray.", {
        duration: 2000,
      });
      const newTrayContents = [...fidgetTrayContents, newFidgetInstanceData];
      saveTrayContents(newTrayContents);
    }

    selectFidget(bundle);
  }

  return (
    <aside
      id="logo-sidebar"
      className="h-screen flex-row flex bg-white transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex-1 w-[270px] h-full max-h-screen pt-12 flex-col flex px-4 py-4 overflow-y-auto border-r">
        <div className="h-full flex-col">
          {selectedFidgetID ? (
            <>{currentFidgetSettings}</>
          ) : (
            <>
              {isPickingFidget ? (
                <FidgetPicker
                  addFidget={addFidget}
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
                fidgetInstanceDatums={fidgetInstanceDatums}
                saveFidgetInstanceDatums={saveFidgetInstanceDatums}
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
          selectedFidgetID={selectedFidgetID}
          selectFidget={selectFidget}
        />
      </div>
    </aside>
  );
};

export default EditorPanel;

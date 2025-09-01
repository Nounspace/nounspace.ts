import {
  FidgetBundle,
  FidgetInstanceData,
} from "@/common/fidgets";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import React, { Dispatch, SetStateAction } from "react";
import FidgetTray from "./FidgetTray";

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
  openFidgetPicker(): void;
  selectFidget(fidgetBundle: FidgetBundle): void;
  addFidgetToGrid(fidget: FidgetInstanceData): boolean;
  onExportConfig?: () => void;
  getCurrentSpaceContext?: () => any;
  onApplySpaceConfig?: (config: any) => Promise<void>;
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
  fidgetTrayContents = [], // fallback to empty array
  saveTrayContents,
  fidgetInstanceDatums,
  saveFidgetInstanceDatums,
  removeFidget,
  openFidgetPicker,
  selectFidget,
  addFidgetToGrid,
  onExportConfig,
  getCurrentSpaceContext,
  onApplySpaceConfig,
}) => {
  const safeFidgetTrayContents = Array.isArray(fidgetTrayContents) ? fidgetTrayContents : [];

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
            <ThemeSettingsEditor
              theme={theme}
              saveTheme={saveTheme} 
              saveExitEditMode={saveExitEditMode}
              cancelExitEditMode={cancelExitEditMode}
              fidgetInstanceDatums={fidgetInstanceDatums}
              onExportConfig={onExportConfig}
              saveFidgetInstanceDatums={saveFidgetInstanceDatums}
              getCurrentSpaceContext={getCurrentSpaceContext}
              onApplySpaceConfig={onApplySpaceConfig}
            />
          )}
        </div>
      </div>
      <div 
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${safeFidgetTrayContents.length > 0 ? 'w-24 opacity-100' : 'w-0 opacity-0'}
        `}
      >
        <FidgetTray
          setCurrentlyDragging={setCurrentlyDragging}
          setExternalDraggedItem={setExternalDraggedItem}
          contents={safeFidgetTrayContents}
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

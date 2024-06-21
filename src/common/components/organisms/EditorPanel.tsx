import React, { Dispatch, SetStateAction } from "react";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetTray from "./FidgetTray";

export interface EditorPanelProps {
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ w: number; h: number } | undefined>
  >;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentFidgetSettings: React.ReactNode;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setExternalDraggedItem,
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  unselect,
  selectedFidgetID,
  currentFidgetSettings,
}) => {
  return (
    <div className="flex w-full">
      <aside
        id="editor-panel"
        className="flex-col h-10/12 z-8 w-7/12 transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Editor"
      >
        <div className="w-full h-full">
          <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
            <div className="flex-col">
              {selectedFidgetID ? (
                <>{currentFidgetSettings}</>
              ) : (
                <>
                  <h1 className="capitalize pb-4 m-2 text-lg">Edit Theme</h1>
                  <ThemeSettingsEditor
                    theme={theme}
                    saveTheme={saveTheme}
                    setEditMode={setEditMode}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="w-4/12">
        <FidgetTray setExternalDraggedItem={setExternalDraggedItem} />
      </div>
    </div>
  );
};

export default EditorPanel;

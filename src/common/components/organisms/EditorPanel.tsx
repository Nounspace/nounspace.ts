import React, { Dispatch, SetStateAction, useState } from "react";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetTray from "./FidgetTray";
import { FidgetInstanceData } from "@/common/fidgets";
import FidgetPicker from "./FidgetPicker";

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
  fidgetTrayContents: FidgetInstanceData[];
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
}) => {
  const [isPickingFidget, setIsPickingFidget] = useState(false);

  function openFidgetPicker() {
    setIsPickingFidget(true);
    unselect();
  }

  function addFidgetToTray(fidget): undefined {
    return;
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
            <div className="flex-col">
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
      <div className="w-4/12">
        <FidgetTray
          setExternalDraggedItem={setExternalDraggedItem}
          contents={fidgetTrayContents}
          openFidgetPicker={openFidgetPicker}
        />
      </div>
    </div>
  );
};

export default EditorPanel;

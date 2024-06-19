import { ThemeSettings } from "@/common/lib/theme";
import React, { ReactNode } from "react";
import EditorPanel from "./EditorPanel";
import Navigation from "./Navigation";

export interface SidebarProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  isEditable: boolean;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentFidgetSettings: React.JSX.Element;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  setEditMode,
  theme,
  saveTheme,
  isEditable,
  unselect,
  selectedFidgetID,
  currentFidgetSettings,
}) => {
  function turnOnEditMode() {
    setEditMode(true);
  }

  return (
    <>
      {editMode ? (
        <EditorPanel
          setEditMode={setEditMode}
          theme={theme}
          saveTheme={saveTheme}
          unselect={unselect}
          selectedFidgetID={selectedFidgetID}
          currentFidgetSettings={currentFidgetSettings}
        />
      ) : (
        <Navigation isEditable={isEditable} setEditMode={setEditMode} />
      )}
    </>
  );
};

export default Sidebar;

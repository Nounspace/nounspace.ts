import { ThemeSettings } from "@/common/lib/theme";
import React, { ReactNode } from "react";
import EditorPanel from "./EditorPanel";
import Navigation from "./Navigation";
import FidgetTray from "./FidgetTray";

export interface SidebarProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  isEditable: boolean;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentSettings: React.JSX.Element;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  setEditMode,
  theme,
  saveTheme,
  isEditable,
  unselect,
  selectedFidgetID,
  currentSettings,
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
          currentSettings={currentSettings}
        />
      ) : (
        <Navigation isEditable={isEditable} setEditMode={setEditMode} />
      )}
    </>
  );
};

export default Sidebar;

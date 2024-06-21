import { ThemeSettings } from "@/common/lib/theme";
import React, { Dispatch, ReactNode, SetStateAction } from "react";
import EditorPanel from "./EditorPanel";
import Navigation from "./Navigation";
import { PlacedGridItem } from "@/fidgets/layout/Grid";

export interface SidebarProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  isEditable: boolean;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentFidgetSettings: React.ReactNode;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ w: number; h: number } | undefined>
  >;
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
  setExternalDraggedItem,
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
          setExternalDraggedItem={setExternalDraggedItem}
        />
      ) : (
        <Navigation isEditable={isEditable} setEditMode={setEditMode} />
      )}
    </>
  );
};

export default Sidebar;

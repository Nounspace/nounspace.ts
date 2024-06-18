import { ThemeSettings } from "@/common/lib/theme";
import React from "react";
import EditorPanel from "./EditorPanel";
import Navigation from "./Navigation";

export interface SidebarProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  isEditable: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  editMode,
  setEditMode,
  theme,
  saveTheme,
  isEditable,
}) => {
  function turnOnEditMode() {
    setEditMode(true);
  }

  return (
    <aside
      id="logo-sidebar"
      className="absolute left-12 top-12 bottom-12 z-8 w-[270px] transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
        {editMode ? (
          <EditorPanel
            editMode={editMode}
            setEditMode={setEditMode}
            theme={theme}
            saveTheme={saveTheme}
          />
        ) : (
          <Navigation isEditable={isEditable} setEditMode={setEditMode} />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

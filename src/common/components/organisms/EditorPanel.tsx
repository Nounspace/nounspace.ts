import React, { useCallback } from "react";
import { RiPencilFill } from "react-icons/ri";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeEditorToolbar from "@/common/lib/theme/ThemeEditorToolbar";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

export interface EditorPanelProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  disabled?: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  editMode,
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
}) => {
  // const toggleEditMode = useCallback(() => {
  //   !disabled && setEditMode(!editMode);
  // }, [editMode, setEditMode, disabled]);
  return (
    <ThemeEditorToolbar
      theme={theme}
      saveTheme={saveTheme}
      setEditMode={setEditMode}
    />
  );
};

export default EditorPanel;

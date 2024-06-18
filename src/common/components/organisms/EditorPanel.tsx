import React, { useCallback, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeEditorToolbar from "@/common/lib/theme/ThemeEditorToolbar";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import FidgetSettingsPopover from "@/common/fidgets/FidgetSettingsPopover";

export interface EditorPanelProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  selectedFidgetID: string | null;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  editMode,
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  selectedFidgetID,
}) => {
  // const toggleEditMode = useCallback(() => {
  //   !disabled && setEditMode(!editMode);
  // }, [editMode, setEditMode, disabled]);
  const [editing, setEditing] = useState(false);

  return (
    <>
      {selectedFidgetID ? (
        <></>
      ) : (
        <ThemeEditorToolbar
          theme={theme}
          saveTheme={saveTheme}
          setEditMode={setEditMode}
        />
      )}
    </>
  );
};

export default EditorPanel;

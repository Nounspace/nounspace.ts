import React, { ReactNode, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetSettingsEditor from "./FidgetSettingsEditor";

export interface EditorPanelProps {
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  selectedFidgetID: string | null;
  currentSettings: React.JSX.Element;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  selectedFidgetID,
  currentSettings = <div>HELLO</div>,
}) => {
  // const toggleEditMode = useCallback(() => {
  //   !disabled && setEditMode(!editMode);
  // }, [editMode, setEditMode, disabled]);
  const [editing, setEditing] = useState(false);

  return (
    <>
      {selectedFidgetID ? (
        <>
          <h1 className="capitalize pb-4 m-2">{selectedFidgetID}</h1>
          {currentSettings}
        </>
      ) : (
        <>
          <h1 className="capitalize pb-4 m-2">Theme Settings</h1>
          <ThemeSettingsEditor
            theme={theme}
            saveTheme={saveTheme}
            setEditMode={setEditMode}
          />
        </>
      )}
    </>
  );
};

export default EditorPanel;

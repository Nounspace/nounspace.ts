import React, { ReactNode, useState } from "react";
import { RiPencilFill } from "react-icons/ri";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeSettingsEditor from "@/common/lib/theme/ThemeSettingsEditor";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import FidgetSettingsEditor from "./FidgetSettingsEditor";
import FidgetTray from "./FidgetTray";

export interface EditorPanelProps {
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  unselect: () => void;
  selectedFidgetID: string | null;
  currentSettings: React.JSX.Element;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  unselect,
  selectedFidgetID,
  currentSettings,
}) => {
  // const toggleEditMode = useCallback(() => {
  //   !disabled && setEditMode(!editMode);
  // }, [editMode, setEditMode, disabled]);
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex w-full">
      <aside
        id="editor-panel"
        className="flex-col h-full z-8 w-7/12 transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Editor"
      >
        <div className="w-full h-full">
          <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
            <div className="flex-col">
              {selectedFidgetID ? (
                <>
                  <div className="flex">
                    <button onClick={unselect} className="my-auto">
                      <BackArrowIcon />
                    </button>
                    <h1 className="capitalize text-lg pl-4">
                      Edit {selectedFidgetID}
                    </h1>
                  </div>
                  {currentSettings}
                </>
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
        <FidgetTray />
      </div>
    </div>
  );
};

const BackArrowIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M5 12L9 8M5 12L9 16"
        stroke="#383838"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EditorPanel;

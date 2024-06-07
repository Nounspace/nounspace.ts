import React, { useCallback } from "react";
import { RiPencilFill } from "react-icons/ri";
import { ThemeSettings } from "@/common/lib/theme";
import ThemeEditorToolbar from "@/common/lib/theme/ThemeEditorToolbar";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

export interface ThemeEditorOverlayProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  theme?: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  disabled?: boolean;

}

export const ThemeEditorOverlay: React.FC<ThemeEditorOverlayProps> = ({
  editMode,
  setEditMode,
  theme = DEFAULT_THEME,
  saveTheme,
  disabled = false
}) => {
  const toggleEditMode = useCallback(
    () => {
      !disabled && setEditMode(!editMode);
    },
    [editMode, setEditMode, disabled]
  );

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-4">
      {
        !disabled && (
          <ThemeEditorToolbar
            theme={theme}
            saveTheme={saveTheme}
            show={editMode}
          />
        )
      }
      <button
        onClick={toggleEditMode}
        className={mergeClasses(
          "flex items-center justify-center",
          "rounded-full bg-white size-12 hover:opacity-100 duration-500",
          editMode
            ? "opacity-100"
            : "opacity-50"
        )}
      >
        <RiPencilFill
          className={
            mergeClasses(
              "text-2xl",
              editMode
                ? "text-slate-900"
                : "text-gray-700"
            )
          }
        />
      </button>
    </div>
  )
}

export default ThemeEditorOverlay;
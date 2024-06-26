import React, { useEffect, useState } from "react";
import { Card, CardFooter } from "@/common/components/atoms/card";
import {
  FaCommentDots,
  FaFloppyDisk,
  FaMusic,
  FaTriangleExclamation,
  FaX,
} from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInputPopoverButton from "@/common/components/molecules/HTMLInputPopoverButton";
import TextInputPopoverButton from "@/common/components/molecules/TextInputPopoverButton";
import BackArrowIcon from "@/common/components/atoms/icons/BackArrow";

export type ThemeSettingsEditorArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
};

export function ThemeSettingsEditor({
  theme = DEFAULT_THEME,
  saveTheme,
  saveExitEditMode,
  cancelExitEditMode,
}: ThemeSettingsEditorArgs) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  function themePropSetter<T extends string>(
    property: string,
  ): (value: T) => void {
    return (value: T): void => {
      saveTheme({
        ...theme,
        properties: {
          ...theme.properties,
          [property]: value,
        },
      });
    };
  }

  function setCSSVar(key: string, value: string) {
    document.documentElement.style.setProperty(key, value);
  }

  const { background, font, backgroundHTML, musicURL } = theme.properties;

  useEffect(() => {
    setCSSVar("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setCSSVar("--user-theme-font", font);
  }, [font]);

  function saveAndClose() {
    saveTheme(theme);
    saveExitEditMode();
  }

  function cancelAndClose() {
    cancelExitEditMode();
  }

  return (
    <>
      <h1 className="capitalize pb-4 m-2 text-lg">Edit Theme</h1>
      <div className="text-lg font-medium">
        <Card className="inset-x-auto shadow-lg">
          <CardFooter className="gap-2 p-3">
            <ColorSelector
              value={background as Color}
              onChange={themePropSetter<Color>("background")}
            />
            <FontSelector
              value={font}
              onChange={themePropSetter<FontFamily>("font")}
            />
            <HTMLInputPopoverButton
              value={backgroundHTML}
              onChange={themePropSetter<string>("backgroundHTML")}
            />
            <TextInputPopoverButton
              value={musicURL}
              onChange={themePropSetter<string>("musicURL")}
            >
              <FaMusic />
            </TextInputPopoverButton>
          </CardFooter>
        </Card>
        <div className="flex flex-col">
          {showConfirmCancel ? (
            // Back Button and Exit Button (shows second)
            <>
              <div className="mt-40 pt-2 flex items-center justify-center">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2]"
                >
                  <div className="flex items-center">
                    <BackArrowIcon />
                  </div>
                </button>
                <button
                  onClick={cancelAndClose}
                  className="ml-4 flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-red-100 text-[#1C64F2] font-semibold"
                >
                  <div className="ml-4 flex items-center">
                    <FaTriangleExclamation
                      className="h-8l shrink-0"
                      aria-hidden="true"
                    />
                    <span className="ml-4 mr-4">Exit</span>
                  </div>
                </button>
              </div>
              <p className="w-full text-center text-xs pt-4 pl-16 pr-16">
                If you exit, any changes made will not be saved.
              </p>
            </>
          ) : (
            // X Button and Save Button (shows first)
            <div className="mt-40 pt-2 flex items-center justify-center">
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-red-100 text-[#1C64F2]"
              >
                <div className="flex items-center p-1">
                  <FaX className="h-8l shrink-0" aria-hidden="true" />
                </div>
              </button>

              <button
                onClick={saveAndClose}
                className="ml-4 flex rounded-xl p-2 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
              >
                <div className="ml-4 flex items-center">
                  <FaFloppyDisk className="h-8l shrink-0" aria-hidden="true" />
                  <span className="ml-4 mr-4">Save</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ThemeSettingsEditor;

import React, { useEffect } from "react";
import { Card, CardFooter } from "@/common/components/atoms/card";
import { FaFloppyDisk, FaMusic } from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInputPopoverButton from "@/common/components/molecules/HTMLInputPopoverButton";
import TextInputPopoverButton from "@/common/components/molecules/TextInputPopoverButton";

export type ThemeSettingsEditorArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  setEditMode: (editMode: boolean) => void;
};

export function ThemeSettingsEditor({
  theme = DEFAULT_THEME,
  saveTheme,
  setEditMode,
}: ThemeSettingsEditorArgs) {
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
    setEditMode(false);
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
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={saveAndClose}
              className="flex justify-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <div className="flex items-center">
                <FaFloppyDisk className="h-8l shrink-0" aria-hidden="true" />
                <span className="ml-4 mr-4">Save Space</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ThemeSettingsEditor;

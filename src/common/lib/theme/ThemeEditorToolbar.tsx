import React from "react";
import { Card, CardFooter } from "@/common/components/atoms/card";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import defaultUserTheme from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInputPopoverButton from "@/common/components/molecules/HTMLInputPopoverButton";

export type ThemeEditorToolbarArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  setEditMode: (editMode: boolean) => void;
};

export function ThemeEditorToolbar({
  theme = defaultUserTheme,
  saveTheme,
  setEditMode,
}: ThemeEditorToolbarArgs) {
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

  const { background, font, backgroundHTML } = theme.properties;

  function saveAndClose() {
    saveTheme(theme);
    setEditMode(false);
  }

  return (
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
        </CardFooter>
      </Card>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
        <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={saveAndClose}
            className="flex justify-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <div className="flex items-center">
              <span className="ml-4 mr-4">Save</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeEditorToolbar;

import React, { useEffect } from "react";
import { Card, CardFooter } from "@/common/components/atoms/card";
import { FaFloppyDisk } from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";

export type ThemeEditorToolbarArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  show: boolean;
};

export function ThemeEditorToolbar({
  theme = DEFAULT_THEME,
  saveTheme,
  show = true,
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

  function setCSSVar(key: string, value: string) {
    document.documentElement.style.setProperty(key, value);
  }

  const { background, font } = theme.properties;

  useEffect(() => {
    setCSSVar("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setCSSVar("--user-theme-font", font);
  }, [font]);

  return (
    show && (
      <>
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
            <FaFloppyDisk className="h-8 w-8 shrink-0" aria-hidden="true" />
          </CardFooter>
        </Card>
      </>
    )
  );
}

export default ThemeEditorToolbar;

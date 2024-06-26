import React, { useEffect, useState } from "react";
import {
  FaFloppyDisk,
  FaTriangleExclamation,
  FaX,
  FaArrowLeftLong,
} from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInput from "@/common/components/molecules/HTMLInput";
import TextInput from "@/common/components/molecules/TextInput";
import { Button } from "@/common/components/atoms/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/atoms/tabs";

export type ThemeSettingsEditorArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
};

const tabListClasses = "w-full p-0 justify-between bg-transparent rounded-none";
const tabTriggerClasses =
  "data-[state=active]:text-blue-600 text-md data-[state=active]:shadow-none data-[state=active]:border-b data-[state=active]:rounded-none data-[state=active]:border-blue-600 data-[state=active]:border-solid px-3 py-2";
const tabContentClasses =
  "py-4 flex flex-col gap-4 hidden data-[state=active]:flex";

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

  const { background, font, fontColor, backgroundHTML, musicURL } =
    theme.properties;

  useEffect(() => {
    setCSSVar("--user-theme-background", background);
  }, [background]);

  useEffect(() => {
    setCSSVar("--user-theme-font", font);
  }, [font]);

  useEffect(() => {
    setCSSVar("--user-theme-font-color", fontColor);
  }, [fontColor]);

  function saveAndClose() {
    saveTheme(theme);
    saveExitEditMode();
  }

  function cancelAndClose() {
    cancelExitEditMode();
  }

  return (
    <>
      <div className="flex flex-col h-full gap-6">
        {/* Back */}
        <div>
          <button
            onClick={cancelAndClose}
            className="flex items-center gap-3 text-lg font-semibold"
          >
            <FaArrowLeftLong className="shrink-0" /> Customize
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <ThemeCard />
          </div>

          <Tabs defaultValue="fonts">
            <TabsList className={tabListClasses}>
              <TabsTrigger value="fonts" className={tabTriggerClasses}>
                Fonts
              </TabsTrigger>
              <TabsTrigger value="style" className={tabTriggerClasses}>
                Style
              </TabsTrigger>
              <TabsTrigger value="code" className={tabTriggerClasses}>
                Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fonts" className={tabContentClasses}>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Headings</h4>
                <div className="flex items-center gap-1">
                  <ColorSelector
                    className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                    innerClassName="rounded-full"
                    value={fontColor as Color}
                    onChange={themePropSetter<Color>("fontColor")}
                  />
                  <FontSelector
                    className="ring-0 focus:ring-0 border-0 shadow-none"
                    value={font}
                    onChange={themePropSetter<FontFamily>("font")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Body</h4>
                <div className="flex items-center gap-1">
                  <ColorSelector
                    className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                    innerClassName="rounded-full"
                    value={background as Color}
                    onChange={themePropSetter<Color>("background")}
                  />
                  <FontSelector
                    className="ring-0 focus:ring-0 border-0 shadow-none"
                    value={font}
                    onChange={themePropSetter<FontFamily>("font")}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="style" className={tabContentClasses}>
              <div className="grid gap-2 grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ThemeCard key={i} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="code" className={tabContentClasses}>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Custom styles</h4>
                <HTMLInput
                  value={backgroundHTML}
                  onChange={themePropSetter<string>("backgroundHTML")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Music</h4>
                <TextInput
                  value={musicURL}
                  onChange={themePropSetter<string>("musicURL")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-2">
          {showConfirmCancel ? (
            <>
              <Button
                onClick={cancelAndClose}
                variant="destructive"
                withIcon
                width="full"
              >
                <FaTriangleExclamation
                  className="shrink-0"
                  aria-hidden="true"
                />
                Cancel
              </Button>
              <Button
                onClick={() => setShowConfirmCancel(false)}
                variant="secondary"
                withIcon
                width="full"
              >
                <FaX className="shrink-0" aria-hidden="true" />
                Nevermind
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={saveAndClose}
                variant="primary"
                withIcon
                width="full"
              >
                <FaFloppyDisk className="shrink-0" aria-hidden="true" />
                Save Space
              </Button>

              <Button
                onClick={() => setShowConfirmCancel(true)}
                variant="secondary"
                withIcon
                width="full"
              >
                <FaX className="shrink-0" aria-hidden="true" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const ThemeCard = () => (
  <div className="bg-gray-50 hover:bg-gray-100 rounded-lg flex gap-2 px-4 py-2 items-center cursor-pointer">
    <div className="text-lg font-bold">Aa</div>
    <div className="rounded-full w-5 h-5 bg-blue-500"></div>
    <div className="rounded-full w-5 h-5 bg-slate-800"></div>
  </div>
);

export default ThemeSettingsEditor;

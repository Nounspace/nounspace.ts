import React, { useEffect, useState } from "react";
import {
  FaFloppyDisk,
  FaTriangleExclamation,
  FaX,
  FaArrowLeftLong,
} from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInput from "@/common/components/molecules/HTMLInput";
import TextInput from "@/common/components/molecules/TextInput";
import BackArrowIcon from "@/common/components/atoms/icons/BackArrow";
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

  const {
    background,
    font,
    fontColor,
    headingsFont,
    headingsFontColor,
    backgroundHTML,
    musicURL,
  } = theme.properties;

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
        <div>Customize</div>

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
                    value={headingsFontColor as Color}
                    onChange={themePropSetter<Color>("headingsFontColor")}
                  />
                  <FontSelector
                    className="ring-0 focus:ring-0 border-0 shadow-none"
                    value={headingsFont}
                    onChange={themePropSetter<FontFamily>("headingsFont")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Body</h4>
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
            </TabsContent>
            <TabsContent value="style" className={tabContentClasses}>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Space background color</h4>
                <ColorSelector
                  className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                  innerClassName="rounded-full"
                  value={background as Color}
                  onChange={themePropSetter<Color>("background")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Fidget style</h4>
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
            </TabsContent>
          </Tabs>

          <div className="my-2 bg-slate-100 h-px"></div>

          <div className="flex flex-col gap-1">
            <h4 className="text-sm">Music</h4>
            <TextInput
              value={musicURL}
              onChange={themePropSetter<string>("musicURL")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-3 pb-8">
          {showConfirmCancel ? (
            // Back Button and Exit Button (shows second)
            <>
              <p className="w-full text-center text-xs pt-1 pl-8 pr-8">
                If you exit, any changes made will not be saved.
              </p>
              <div className="flex items-center justify-center">
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
            </>
          ) : (
            // X Button and Save Button (shows first)
            <>
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
                    <FaFloppyDisk
                      className="h-8l shrink-0"
                      aria-hidden="true"
                    />
                    <span className="ml-4 mr-4">Save</span>
                  </div>
                </button>
              </div>
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

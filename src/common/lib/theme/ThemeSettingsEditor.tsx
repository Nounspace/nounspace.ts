import React, { useState } from "react";
import { FaFloppyDisk, FaTriangleExclamation, FaX } from "react-icons/fa6";
import { ThemeSettings } from "@/common/lib/theme";
import { Color, FontFamily } from "@/common/lib/theme";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import BorderSelector from "@/common/components/molecules/BorderSelector";
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
import {
  tabListClasses,
  tabTriggerClasses,
  tabContentClasses,
} from "@/common/lib/theme/helpers";

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

  const {
    background,
    font,
    fontColor,
    headingsFont,
    headingsFontColor,
    backgroundHTML,
    musicURL,
    fidgetBackground,
    fidgetBorderWidth,
    fidgetBorderColor,
    fidgetShadow,
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
                    hideGlobalSettings
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
                    hideGlobalSettings
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="style" className={tabContentClasses}>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold">Space</h4>
                <h4 className="text-sm">Background color</h4>
                <ColorSelector
                  className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                  innerClassName="rounded-full"
                  value={background as Color}
                  onChange={themePropSetter<Color>("background")}
                />
              </div>

              {/* Fidget styles */}
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold">Fidgets</h4>

                <div className="flex flex-col gap-1">
                  <div className="">
                    <h5 className="text-xs">Background color</h5>
                    <ColorSelector
                      className="rounded-full overflow-hidden w-6 h-6 shrink-0 my-2"
                      innerClassName="rounded-full"
                      value={fidgetBackground as Color}
                      onChange={themePropSetter<Color>("fidgetBackground")}
                    />
                  </div>
                  <div className="">
                    <h5 className="text-xs">Border</h5>
                    <div className="flex items-center gap-1">
                      <ColorSelector
                        className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                        innerClassName="rounded-full"
                        value={fidgetBorderColor as Color}
                        onChange={themePropSetter<Color>("fidgetBorderColor")}
                      />
                      <BorderSelector
                        className="ring-0 focus:ring-0 border-0 shadow-none"
                        value={fidgetBorderWidth as string}
                        onChange={themePropSetter<string>("fidgetBorderWidth")}
                        hideGlobalSettings
                      />
                    </div>
                  </div>
                  <div className="">
                    <h5 className="text-xs">Shadow</h5>
                    <ShadowSelector
                      className="ring-0 focus:ring-0 border-0 shadow-none"
                      value={fidgetShadow as string}
                      onChange={themePropSetter<string>("fidgetShadow")}
                      hideGlobalSettings
                    />
                  </div>
                </div>
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
              <div className="flex items-center gap-2 justify-center">
                <Button
                  onClick={() => setShowConfirmCancel(false)}
                  size="icon"
                  variant="secondary"
                >
                  <BackArrowIcon />
                </Button>
                <Button
                  onClick={cancelAndClose}
                  variant="destructive"
                  width="auto"
                  withIcon
                >
                  <FaTriangleExclamation
                    className="h-8l shrink-0"
                    aria-hidden="true"
                  />
                  <span>Exit</span>
                </Button>
              </div>
            </>
          ) : (
            // X Button and Save Button (shows first)
            <>
              <div className="gap-2 pt-2 flex items-center justify-center">
                <Button
                  onClick={() => setShowConfirmCancel(true)}
                  size="icon"
                  variant="secondary"
                >
                  <FaX aria-hidden="true" />
                </Button>

                <Button
                  onClick={saveAndClose}
                  variant="primary"
                  width="auto"
                  withIcon
                >
                  <FaFloppyDisk aria-hidden="true" />
                  <span>Save</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const ThemeCard = () => {
  return (
    <div
      className="bg-gray-50 hover:bg-gray-100 rounded-lg flex gap-2 px-4 py-2 items-center"
      style={{
        backgroundColor: "var(--user-theme-background)",
      }}
    >
      <div className="text-lg font-bold">
        <span
          style={{
            fontFamily: "var(--user-theme-headings-font)",
            color: "var(--user-theme-headings-font-color)",
          }}
        >
          A
        </span>
        <span
          style={{
            fontFamily: "var(--user-theme-font)",
            color: "var(--user-theme-font-color)",
          }}
        >
          a
        </span>
      </div>
      <div
        className="rounded-full w-5 h-5 bg-blue-500"
        style={{
          backgroundColor: "var(--user-theme-fidget-background)",
          borderWidth: "var(--user-theme-fidget-border-width)",
          borderColor: "var(--user-theme-fidget-border-color)",
          boxShadow: "var(--user-theme-fidget-shadow)",
        }}
      ></div>
    </div>
  );
};

export default ThemeSettingsEditor;

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
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/common/components/atoms/tooltip";
import { FaInfoCircle, FaPencilAlt } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { THEMES } from "@/constants/themes";
import { ThemeCard } from "@/common/lib/theme/ThemeCard";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";

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
  const [activeTheme, setActiveTheme] = useState(theme.id);

  function themePropSetter<T extends string>(
    property: string,
  ): (value: string) => void {
    return (value: string): void => {
      saveTheme({
        ...theme,
        properties: {
          ...theme.properties,
          [property]: value,
        },
      });
      if (property === "musicURL") {
        analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: value });
      }
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

  const handleApplyTheme = (selectedTheme: ThemeSettings) => {
    saveTheme(selectedTheme);
    setActiveTheme(selectedTheme.id);
  };

  return (
    <>
      <div className="flex flex-col h-full gap-6">
        {/* Theme Editor Title */}
        <div className="flex items-center gap-1">
          <div className="font-semibold">Edit Theme</div>
        </div>

        <div className="h-full overflow-auto flex flex-col gap-4 -mx-2 px-2">
          <div className="grid gap-4">
            {/* Theme Card Example */}
            <ThemeCard themeProps={theme.properties} />

            {/* Templates Dropdown */}
            <label>
              <input
                className="peer/showLabel absolute scale-0"
                type="checkbox"
              />
              <span className="block max-h-14 max-w-xs overflow-hidden rounded-lg px-4 py-0 shadow-md transition-all duration-300 peer-checked/showLabel:max-h-full">
                <h4 className="flex h-14 cursor-pointer items-center font-bold">
                  Templates
                </h4>
                <div className="grid grid-cols-2 gap-3 pb-3 pt-3">
                  {THEMES.map((theme, i) => (
                    <ThemeCard
                      key={`${theme.id}-${i}`}
                      themeProps={theme.properties}
                      onClick={() => handleApplyTheme(theme)}
                      active={activeTheme === theme.id}
                    />
                  ))}
                </div>
              </span>
            </label>

            {/* Templates Dropdown */}
            <div className="grid gap-2">
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

                {/* Fonts */}
                <TabsContent value="fonts" className={tabContentClasses}>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Headings</h4>
                      <ThemeSettingsTooltip text="The primary, or header font that Fidgets can inherit." />
                    </div>
                    <div className="flex items-center gap-1">
                      <ColorSelector
                        className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                        innerClassName="rounded-full"
                        value={headingsFontColor as Color}
                        onChange={themePropSetter<Color>("headingsFontColor")}
                      />
                      <FontSelector
                        className="ring-0 focus:ring-0 border-0 shadow-none"
                        value={
                          FONT_FAMILY_OPTIONS_BY_NAME[headingsFont]?.config
                            ?.style.fontFamily
                        }
                        onChange={themePropSetter<FontFamily>("headingsFont")}
                        hideGlobalSettings
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Body</h4>
                      <ThemeSettingsTooltip text="The secondary, or body font that Fidgets can inherit." />
                    </div>
                    <div className="flex items-center gap-1">
                      <ColorSelector
                        className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                        innerClassName="rounded-full"
                        value={fontColor as Color}
                        onChange={themePropSetter<Color>("fontColor")}
                      />
                      <FontSelector
                        className="ring-0 focus:ring-0 border-0 shadow-none"
                        value={
                          FONT_FAMILY_OPTIONS_BY_NAME[font]?.config?.style
                            .fontFamily
                        }
                        onChange={themePropSetter<FontFamily>("font")}
                        hideGlobalSettings
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Style */}
                <TabsContent value="style" className={tabContentClasses}>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold my-2">Space Settings</h4>
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Background color</h4>
                      <ThemeSettingsTooltip text="Set a solid background or gradient color. You can also add custom backgrounds with HTML/CSS on the Code tab." />
                    </div>
                    <ColorSelector
                      className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                      innerClassName="rounded-full"
                      value={background as Color}
                      onChange={themePropSetter<Color>("background")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold my-2">Fidget Settings</h4>
                    <div className="flex flex-col gap-1">
                      <div className="">
                        <div className="flex flex-row gap-1">
                          <h5 className="text-sm">Background color</h5>
                          <ThemeSettingsTooltip text="Set the default background color for all Fidgets on your Space." />
                        </div>
                        <ColorSelector
                          className="rounded-full overflow-hidden w-6 h-6 shrink-0 my-2"
                          innerClassName="rounded-full"
                          value={fidgetBackground as Color}
                          onChange={themePropSetter<Color>("fidgetBackground")}
                        />
                      </div>
                      <div className="">
                        <div className="flex flex-row gap-1">
                          <h5 className="text-sm">Border</h5>
                          <ThemeSettingsTooltip text="Set the default border width and color for all Fidgets on your Space." />
                        </div>
                        <div className="flex items-center gap-1">
                          <ColorSelector
                            className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                            innerClassName="rounded-full"
                            value={fidgetBorderColor as Color}
                            onChange={themePropSetter<Color>(
                              "fidgetBorderColor",
                            )}
                          />
                          <BorderSelector
                            className="ring-0 focus:ring-0 border-0 shadow-none"
                            value={fidgetBorderWidth as string}
                            onChange={themePropSetter<string>(
                              "fidgetBorderWidth",
                            )}
                            hideGlobalSettings
                          />
                        </div>
                      </div>
                      <div className="">
                        <div className="flex flex-row gap-1">
                          <h5 className="text-sm">Shadow</h5>
                          <ThemeSettingsTooltip text="Set the default shadow for all Fidgets on your Space." />
                        </div>
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

                {/* Code */}
                <TabsContent value="code" className={tabContentClasses}>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Custom styles</h4>
                      <ThemeSettingsTooltip text="Add HTML/CSS as a single file to customize your background. Pro tip: ask AI for help coding the background of your dreams" />
                    </div>
                    <HTMLInput
                      value={backgroundHTML}
                      onChange={themePropSetter<string>("backgroundHTML")}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <div className="flex flex-row gap-1">
                <h4 className="text-sm mt-4">Music</h4>
                <ThemeSettingsTooltip text="Paste the youtube link for any song, video, or playlist." />
              </div>
              <TextInput
                value={musicURL}
                onChange={themePropSetter<string>("musicURL")}
              />
            </div>
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

const ThemeSettingsTooltip = ({ text }: { text: string }) => {
  return (
    <div className="flex grow flex-row-reverse">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 pl-1">
              <FaInfoCircle color="#D1D5DB" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-44">{text}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ThemeSettingsEditor;

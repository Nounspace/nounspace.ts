import React, { useState } from "react";
import { FaFloppyDisk, FaTriangleExclamation, FaX } from "react-icons/fa6";
import { ThemeSettings, ThemeProperties } from "@/common/lib/theme";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/common/components/atoms/tooltip";
import { FaInfoCircle, FaPencilAlt, FaCheck } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import CustomHTMLBackground from "@/common/components/molecules/CustomHTMLBackground";
import { THEMES, DEFAULT_THEME_WITH_VARIABLES } from "@/constants/themes";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/components/molecules/FontSelector";

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
  const [showCustomizeTheme, setShowCustomizeTheme] = useState(false);
  const [activeTheme, setActiveTheme] = useState(theme.id);

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

  const handleApplyTheme = (selectedTheme: ThemeSettings) => {
    saveTheme(selectedTheme);
    setActiveTheme(selectedTheme.id);
  };

  return (
    <>
      <div className="flex flex-col h-full gap-6">
        {/* Theme picker */}
        {!showCustomizeTheme && (
          <>
            <div className="flex items-center gap-1">
              <div className="font-semibold">Edit Theme</div>
            </div>
            <div className="h-full overflow-auto flex flex-col gap-4 -mx-2 px-2">
              <div className="grid gap-4">
                <ThemeCard themeProps={theme.properties} />
                <div className="grid gap-2">
                  <h4 className="text-sm">Styles</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {THEMES.map((theme, i) => (
                      <ThemeCard
                        key={`${theme.id}-${i}`}
                        themeProps={theme.properties}
                        onClick={() => handleApplyTheme(theme)}
                        active={activeTheme === theme.id}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => setShowCustomizeTheme(true)}
                  variant="secondary"
                  withIcon
                  width="full"
                >
                  Customize
                  <FaPencilAlt />
                </Button>
              </div>
            </div>
          </>
        )}
        {showCustomizeTheme && (
          <>
            <div className="flex items-center gap-1">
              <div
                className="cursor-pointer flex items-center gap-2 font-semibold"
                onClick={() => setShowCustomizeTheme(false)}
              >
                <FaArrowLeftLong />
                Customize
              </div>
            </div>
            {/* Content */}
            <div className="h-full overflow-auto flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <ThemeCard
                  themeProps={
                    THEMES.filter((theme) => theme.id === "default")[0]
                      ?.properties
                  }
                />
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
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Headings</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 pl-1">
                              <FaInfoCircle color="#D1D5DB" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              <div>
                                The primary, or header font that Fidgets can
                                inherit.
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                        value={headingsFont}
                        onChange={themePropSetter<FontFamily>("headingsFont")}
                        hideGlobalSettings
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Body</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 pl-1">
                              <FaInfoCircle color="#D1D5DB" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              <div>
                                The secondary, or body font that Fidgets can
                                inherit.
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Background color</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 pl-1">
                              <FaInfoCircle color="#D1D5DB" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              <div>
                                Set a solid background or gradient color.
                                <br />
                                You can also add custom backgrounds
                                <br />
                                with HTML/CSS on the Code tab.
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
                        <div className="flex flex-row gap-1">
                          <h5 className="text-sm">Background color</h5>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 pl-1">
                                  <FaInfoCircle color="#D1D5DB" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1">
                                  <div>
                                    Set a background color or gradient that
                                    fidgets can inherit.
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                          <h5 className="text-xs">Border</h5>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 pl-1">
                                  <FaInfoCircle color="#D1D5DB" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1">
                                  <div>
                                    Set the default border width and color
                                    <br />
                                    for all Fidgets on your Space.
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                          <h5 className="text-xs">Shadow</h5>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 pl-1">
                                  <FaInfoCircle color="#D1D5DB" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1">
                                  <div>
                                    Set the default shadow for all Fidgets on
                                    your Space.
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                <TabsContent value="code" className={tabContentClasses}>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Custom styles</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 pl-1">
                              <FaInfoCircle color="#D1D5DB" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col gap-1">
                              <div>
                                Add HTML/CSS as a single file
                                <br />
                                to customize your background.
                                <br />
                                Pro tip: ask AI for help coding
                                <br />
                                the background of your dreams
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <HTMLInput
                      value={backgroundHTML}
                      onChange={themePropSetter<string>("backgroundHTML")}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="my-2 bg-slate-100 h-px"></div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-1">
                  <h4 className="text-sm">Music</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 pl-1">
                          <FaInfoCircle color="#D1D5DB" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Paste the youtube link for any song, video, or playlist.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <TextInput
                  value={musicURL}
                  onChange={themePropSetter<string>("musicURL")}
                />
              </div>
            </div>
          </>
        )}

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

const ThemeCard = ({
  themeProps,
  onClick,
  active,
}: {
  themeProps: ThemeProperties;
  onClick?: () => void;
  active?: boolean;
}) => {
  const activeRingBeforeElementClasses =
    "before:content-[''] before:absolute before:inset-0 before:rounded-lg before:ring-2 before:ring-blue-500 before:z-10";
  return (
    <div
      className={`bg-gray-50 hover:bg-gray-100 rounded-lg grid [grid-template-areas:'cell'] h-11 cursor-pointer relative ${active ? activeRingBeforeElementClasses : ""}`}
      style={{
        backgroundColor: themeProps.background,
      }}
      onClick={onClick}
    >
      {active && (
        <div className="absolute -right-1 -top-1 w-4 h-4 bg-blue-500 rounded-full grid place-content-center z-10">
          <FaCheck className="fill-white w-2 h-2" />
        </div>
      )}
      {themeProps.backgroundHTML && (
        <div className="[grid-area:cell] relative overflow-hidden rounded-lg">
          <CustomHTMLBackground
            html={themeProps.backgroundHTML}
            noSanitize
            className="absolute pointer-events-none inset-0"
          />
        </div>
      )}
      <div className="[grid-area:cell] flex gap-2 px-4 py-2 items-center z-10">
        <div className="text-lg font-bold">
          <span
            style={{
              fontFamily:
                FONT_FAMILY_OPTIONS_BY_NAME[themeProps.headingsFont]?.config
                  ?.style.fontFamily,
              color: themeProps.headingsFontColor,
            }}
          >
            A
          </span>
          <span
            style={{
              fontFamily:
                FONT_FAMILY_OPTIONS_BY_NAME[themeProps.font]?.config?.style
                  .fontFamily,
              color: themeProps.fontColor,
            }}
          >
            a
          </span>
        </div>
        <div
          className="rounded-full w-5 h-5 bg-blue-500"
          style={{
            backgroundColor: themeProps.fidgetBackground,
            borderWidth: themeProps.fidgetBorderWidth,
            borderColor: themeProps.fidgetBorderColor,
            boxShadow: themeProps.fidgetShadow,
          }}
        ></div>
      </div>
    </div>
  );
};

export default ThemeSettingsEditor;

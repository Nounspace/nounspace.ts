/* eslint-disable react/react-in-jsx-scope */
import { Button } from "@/common/components/atoms/button";
import BackArrowIcon from "@/common/components/atoms/icons/BackArrow";
import Spinner from "@/common/components/atoms/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/atoms/tooltip";
import BorderSelector from "@/common/components/molecules/BorderSelector";
import ColorSelector from "@/common/components/molecules/ColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import HTMLInput from "@/common/components/molecules/HTMLInput";
import ShadowSelector from "@/common/components/molecules/ShadowSelector";
import { VideoSelector } from "@/common/components/molecules/VideoSelector";
import { useAppStore } from "@/common/data/stores/app";
import { useToastStore } from "@/common/data/stores/toastStore";
import { Color, FontFamily, ThemeSettings } from "@/common/lib/theme";
import { FidgetInstanceData } from "@/common/fidgets";
import { ThemeCard } from "@/common/lib/theme/ThemeCard";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FONT_FAMILY_OPTIONS_BY_NAME } from "@/common/lib/theme/fonts";
import {
  tabContentClasses,
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
import { SPACE_CONTRACT_ADDR } from "@/constants/spaceToken";
import { THEMES } from "@/constants/themes";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState, useMemo } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { FaFloppyDisk, FaTriangleExclamation, FaX } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import { Address, formatUnits, zeroAddress } from "viem";
import { base } from "viem/chains";
import { useBalance } from "wagmi";
import { CompleteFidgets } from "@/fidgets";
import { DEFAULT_FIDGET_ICON_MAP } from "@/constants/mobileFidgetIcons";
import MobileSettings from "@/common/components/organisms/MobileSettings";
import { MiniApp } from "@/common/components/molecules/MiniAppSettings";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";

export type ThemeSettingsEditorArgs = {
  theme: ThemeSettings;
  saveTheme: (newTheme: ThemeSettings) => void;
  saveExitEditMode: () => void;
  cancelExitEditMode: () => void;
  fidgetInstanceDatums: { [key: string]: FidgetInstanceData };
  saveFidgetInstanceDatums: (datums: { [key: string]: FidgetInstanceData }) => Promise<void>;
};

export function ThemeSettingsEditor({
  theme = DEFAULT_THEME,
  saveTheme,
  saveExitEditMode,
  cancelExitEditMode,
  fidgetInstanceDatums,
  saveFidgetInstanceDatums,
}: ThemeSettingsEditorArgs) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [activeTheme, setActiveTheme] = useState(theme.id);
  const { mobilePreview, setMobilePreview } = useMobilePreview();
  const [tabValue, setTabValue] = useState(
    mobilePreview ? "mobile" : "space",
  );

  useEffect(() => {
    setMobilePreview(tabValue === "mobile");
  }, [tabValue, setMobilePreview]);

  const miniApps = useMemo<MiniApp[]>(() => {
    return Object.values(fidgetInstanceDatums).map((d, i) => {
      const props = CompleteFidgets[d.fidgetType]?.properties;
      const defaultIcon = DEFAULT_FIDGET_ICON_MAP[d.fidgetType] ?? 'HomeIcon';
      return {
        id: d.id,
        name: d.fidgetType,
        mobileDisplayName:
          (d.config.settings.customMobileDisplayName as string) ||
          props?.mobileFidgetName ||
          props?.fidgetName,
        context: props?.fidgetName,
        order: (d.config.settings.mobileOrder as number) || i + 1,
        icon: (d.config.settings.mobileIconName as string) || defaultIcon,
        displayOnMobile: d.config.settings.showOnMobile !== false,
      };
    });
  }, [fidgetInstanceDatums]);

  const handleUpdateMiniApp = (app: MiniApp) => {
    const datum = fidgetInstanceDatums[app.id];
    if (!datum) return;
    const newDatums = {
      ...fidgetInstanceDatums,
      [app.id]: {
        ...datum,
        config: {
          ...datum.config,
          settings: {
            ...datum.config.settings,
            customMobileDisplayName: app.mobileDisplayName,
            mobileIconName: app.icon,
            showOnMobile: app.displayOnMobile,
            mobileOrder: app.order,
          },
        },
      },
    };
    saveFidgetInstanceDatums(newDatums);
  };

  const handleReorderMiniApps = (apps: MiniApp[]) => {
    const newDatums: { [key: string]: FidgetInstanceData } = {};
    apps.forEach((app, index) => {
      const datum = fidgetInstanceDatums[app.id];
      if (!datum) return;
      newDatums[app.id] = {
        ...datum,
        config: {
          ...datum.config,
          settings: {
            ...datum.config.settings,
            mobileOrder: index + 1,
          },
        },
      };
    });
    saveFidgetInstanceDatums(newDatums);
  };

  function themePropSetter<_T extends string>(property: string): (value: string) => void {
    return (value: string): void => {
      const newTheme = {
        ...theme,
        properties: {
          ...theme.properties,
          [property]: value,
        },
      };
      if (property === "musicURL") {
        analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: value });
      }

      // Update CSS variables for global theme
      if (property === "font" || property === "headingsFont") {
        const fontConfig = FONT_FAMILY_OPTIONS_BY_NAME[value];
        if (fontConfig) {
          document.documentElement.style.setProperty(
            property === "font" ? "--user-theme-font" : "--user-theme-headings-font",
            fontConfig.config.style.fontFamily
          );
        }
      }

      if (property === "fontColor" || property === "headingsFontColor") {
        document.documentElement.style.setProperty(
          property === "fontColor" ? "--user-theme-font-color" : "--user-theme-headings-font-color",
          value
        );
      }

      saveTheme(newTheme);
    };
  }

  const {
    background,
    font,
    fontColor,
    headingsFont,
    headingsFontColor,
    backgroundHTML,
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
        <div className="flex-col items-center">
          <div className="font-semibold">Edit Theme</div>
          <p className="text-gray-400 text-sm">
            Select a template or{" "}
            <a
              href="https://nounspace.notion.site/Quick-start-Customization-f5aae8f1bef24309a13ca561d7b80fa7?pvs=4"
              target="_blank"
              rel="noreferrer noopener"
              className="underline cursor-pointer"
            >
              learn how to customize
            </a>
          </p>
        </div>
        <div className="h-full overflow-auto flex flex-col gap-4 -mx-2 px-2">
          <div className="grid gap-4">
            <label>
              <input
                className="peer/showLabel absolute scale-0"
                type="checkbox"
              />
              {/* Templates Dropdown */}
              <span className="block max-h-14 max-w-xs overflow-hidden rounded-lg transition-all duration-300 peer-checked/showLabel:max-h-full p-1">
                <div className="flex flex-row w-full">
                  <div className="flex basis-3/4 grow">
                    {/* Theme Card Example */}
                    <ThemeCard themeProps={theme.properties} />
                  </div>
                  <div className="flex basis-1/4 items-center justify-center">
                    <MdMenuBook className="w-6 h-6" />
                  </div>
                </div>

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
              <Tabs value={tabValue} onValueChange={setTabValue}>
                {/* controlled Tabs */}
                <TabsList className={tabListClasses}>
                  <TabsTrigger value="space" className={tabTriggerClasses}>
                    Space
                  </TabsTrigger>
                  <TabsTrigger value="fidgets" className={tabTriggerClasses}>
                    Fidgets
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className={tabTriggerClasses}>
                    Mobile
                  </TabsTrigger>
                </TabsList>
                {/* Space */}
                <TabsContent value="space" className={tabContentClasses}>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Heading Font</h4>
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
                        value={headingsFont}
                        onChange={themePropSetter<FontFamily>("headingsFont")}
                        hideGlobalSettings
                        isThemeEditor
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Body Font</h4>
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
                        value={font}
                        onChange={themePropSetter<FontFamily>("font")}
                        hideGlobalSettings
                        isThemeEditor
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-4">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Background color</h4>
                      <ThemeSettingsTooltip text="Set a solid background or gradient color. You can also add custom backgrounds with HTML/CSS on the Generate section." />
                    </div>
                    <ColorSelector
                      className="rounded-full overflow-hidden w-6 h-6 shrink-0"
                      innerClassName="rounded-full"
                      value={background as Color}
                      onChange={themePropSetter<Color>("background")}
                    />
                  </div>
                  <BackgroundGenerator
                    backgroundHTML={backgroundHTML}
                    onChange={themePropSetter<string>("backgroundHTML")}
                  />
                  <div className="grid gap-2 mt-4">
                    <div className="flex flex-row gap-1">
                      <h4 className="text-sm">Music</h4>
                      <ThemeSettingsTooltip text="Search or paste Youtube link for any song, video, or playlist." />
                    </div>
                    <VideoSelector
                      initialVideoURL={theme.properties.musicURL}
                      onVideoSelect={themePropSetter("musicURL")}
                    />
                  </div>
                </TabsContent>
                {/* Fidgets */}
                <TabsContent value="fidgets" className={tabContentClasses}>
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
                </TabsContent>
                {/* Mobile */}
                <TabsContent value="mobile" className={tabContentClasses}>
                  <MobileSettings
                    miniApps={miniApps}
                    onUpdateMiniApp={handleUpdateMiniApp}
                    onReorderMiniApps={handleReorderMiniApps}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">

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
      </div>
    </>
  );
}

const BackgroundGenerator = ({
  backgroundHTML,
  onChange,
}: {
  backgroundHTML: string;
  onChange: (value: string) => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateText, setGenerateText] = useState("Generate");
  const [showBanner, setShowBanner] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [internalBackgroundHTML, setInternalBackgroundHTML] = useState(backgroundHTML);
  const timersRef = useRef<number[]>([]);
  const { showToast } = useToastStore();
  
  // Sync internal state with props when backgroundHTML changes
  useEffect(() => {
    setInternalBackgroundHTML(backgroundHTML);
  }, [backgroundHTML]);

  // Random prompt choices
  const randomPrompts = [
    "Warm sunset gradient",
    "Soft pastel stripes",
    "Floating bubble circles",
    "Calm teal radial glow",
    "Lush green rainforest",
    "Animated purple gradient"
  ];

  const { user } = usePrivy();
  const result = useBalance({
    address: (user?.wallet?.address as Address) || zeroAddress,
    token: SPACE_CONTRACT_ADDR,
    chainId: base.id,
  });
  const spaceHoldAmount = result?.data
    ? parseInt(formatUnits(result.data.value, result.data.decimals))
    : 0;
  const userHoldEnoughSpace = spaceHoldAmount >= 1111;
  const { hasNogs } = useAppStore((state) => ({
    hasNogs: state.account.hasNogs,
  }));

  const handleGenerateBackground = async (promptText: string) => {
    try {
      analytics.track(AnalyticsEvent.GENERATE_BACKGROUND, {
        user_input: promptText,
      });
      const response = await fetch(`/api/venice/background`, {
        method: "POST",
        body: JSON.stringify({ text: promptText }),
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      onChange(data.response);
      showToast(
        "Hope you love your new background! To refine it, try adding a prompt before the code and click 'Generate' again.",
        10000,
        "background-generated",
        true,
      );
    } catch (error) {
      console.error("Error generating background:", error);
    } finally {
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current = [];
      setGenerateText("Generate");
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const messages = [
      "Analyzing…",
      "Imagining…",
      "Coding…",
      "Reviewing…",
      "Improving…",
    ];
    let index = 0;
    setGenerateText(messages[index]);
    const intervalId = window.setInterval(() => {
      index = (index + 1) % messages.length;
      setGenerateText(messages[index]);
    }, 8000);
    timersRef.current = [intervalId];
    
    // If field is empty, use a random prompt from the list
    const inputText = internalBackgroundHTML.trim() === "" 
      ? randomPrompts[Math.floor(Math.random() * randomPrompts.length)]
      : internalBackgroundHTML;

    console.log(`inputText: ${inputText}`);
      
    handleGenerateBackground(inputText);
  };

  const handleGenerateWrapper = () => {
    // Allow generation if user holds enough SPACE or has nOGs
    if (!userHoldEnoughSpace && !hasNogs) {
      setButtonDisabled(true);
      setShowBanner(true);
      return;
    }
    handleGenerate();
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-1">
        <h4 className="text-sm">Prompt and/or HTML/CSS</h4>
        <ThemeSettingsTooltip text="Customize your background with HTML/CSS, or describe your dream background and click Generate. To modify existing code, add a prompt before the code and click Generate." />
      </div>
      <HTMLInput
        value={backgroundHTML}
        onChange={(value) => {
          setInternalBackgroundHTML(value);
          onChange(value);
        }}
        placeholder="Customize your background with HTML/CSS, or describe your dream background and click Generate."
      />
      <Button
        onClick={handleGenerateWrapper}
        variant="primary"
        width="auto"
        withIcon
        disabled={buttonDisabled || isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <Spinner className="size-6" />
        ) : (
          <SparklesIcon className="size-5" />
        )}
        <span>{isGenerating ? generateText : "Generate"}</span>
      </Button>
      {showBanner && (
        <div className="flex gap-1 items-center border-2 border-red-600 text-red-600 bg-red-100 rounded-lg p-2 text-sm font-medium">
          <p>
            Hold at least 1,111{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.nounspace.com/t/base/0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab"
              className="font-bold underline"
            >
              $SPACE
            </a>{" "}
            or 1{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://highlight.xyz/mint/base:0xD094D5D45c06c1581f5f429462eE7cCe72215616"
              className="font-bold underline"
            >
              nOGs
            </a>{" "}
            to unlock generation
          </p>
        </div>
      )}
    </div>
  );
};

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

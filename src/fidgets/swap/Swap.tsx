import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { Widget } from "./Widget";
import SimpleColorSelector from "@/common/components/molecules/SimpleColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import ThemeSelector from "@/common/components/molecules/ThemeSelector";
import { WidgetTheme } from "@lifi/widget";
import { resolveCssVariable } from "./utils/cssUtils";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import WidthSlider from "@/common/components/molecules/ScaleSliderSelector";

export type LifiFidgetSettings = {
  text: string;
  background: string;
  components: string;
  fontFamily: string;
  fontColor: string;
  secondaryColor: string;
  headerColor: string;
  message: string;
  themes?: WidgetTheme;
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: number;
  toChain: number;
  swapScale: number;
} & FidgetSettingsStyle;

const lifiProperties: FidgetProperties = {
  fidgetName: "Swap",
  icon: 0x1f501,
  fields: [
    {
      fieldName: "defaultSellToken",
      default: "",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "defaultBuyToken",
      default: "0x0a93a7BE7e7e426fC046e204C44d6b03A302b631",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "fromChain",
      default: 8453,
      required: false,
      inputSelector: ChainSelector,
      group: "settings",
    },
    {
      fieldName: "toChain",
      default: 8453,
      required: false,
      inputSelector: ChainSelector,
      group: "settings",
    },
    {
      fieldName: "themes",
      default: "Custom",
      required: false,
      inputSelector: ThemeSelector,
      group: "style",
    },
    {
      fieldName: "background",
      default: "",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "components",
      default: "",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "fontFamily",
      default: "Londrina Solid",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "secondaryColor",
      default: "",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "swapScale",
      default: 1,
      required: false,
      inputSelector: WidthSlider,
      group: "style",
    },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Swap: React.FC<FidgetArgs<LifiFidgetSettings>> = ({ settings }) => {
  const background = settings.background?.startsWith("var")
    ? resolveCssVariable(settings.background)
    : settings.background || resolveCssVariable("");

  const components = settings.components?.startsWith("var")
    ? resolveCssVariable(settings.components)
    : settings.components || resolveCssVariable("");

  const fontFamily = settings.fontFamily || "Londrina Solid";

  const fontColor =
    settings.fontColor || resolveCssVariable("--user-theme-font-color");

  const secondaryColor =
    settings.secondaryColor ||
    resolveCssVariable("--user-theme-secondary-color");

  function calculateHeight(value: number) {
    const translation = (value - 1) * 30;
    console.log("calculateHeight", translation);
    console.log("calculateHeight", `${translation}%`);
    return `${translation}%`;
  }

  return (
    <div
      style={{
        overflow: "auto",
        width: "100%",
        marginTop: calculateHeight(settings.swapScale),
        transform: `scale(${settings.swapScale})`,
      }}
    >
      <Widget
        background={background}
        fontFamily={fontFamily}
        components={components}
        fontColor={fontColor}
        secondaryColor={secondaryColor}
        themes={settings.themes || {}}
        sellToken={settings.defaultSellToken}
        buyToken={settings.defaultBuyToken}
        fromChain={settings.fromChain || 8453}
        toChain={settings.toChain | 8453}
      />
    </div>
  );
};

export default {
  fidget: Swap,
  properties: lifiProperties,
} as FidgetModule<FidgetArgs<LifiFidgetSettings>>;

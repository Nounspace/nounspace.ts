import React, { useEffect } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import SimpleColorSelector from "@/common/components/molecules/SimpleColorSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import WidthSlider from "@/common/components/molecules/ScaleSliderSelector";
import { Widget, WidgetConfig } from "@rango-dev/widget-embedded";
import ColorSelector from "@/common/components/molecules/ColorSelector";

type RangoFidgetSettings = {
  SwapTitle: string;
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: string;
  toChain: string;
  // style
  background: string;
  fontFamily: string;
  fontColor: string;
  swapScale: number;
  borderRadius: number;
  padding: string;
  margin: string;
  foreground: string;
  swapItem: string;
  primary: string;
  secondary: string;
} & FidgetSettingsStyle;

const rangoProperties: FidgetProperties = {
  fidgetName: "Swap2",
  icon: 0x1f501,
  fields: [
    {
      fieldName: "SwapTitle",
      default: "Swap Widget",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "defaultSellToken",
      default: "ETH",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "defaultBuyToken",
      default: "ETH",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "fromChain",
      default: "BASE",
      required: false,
      inputSelector: ChainSelector,
      group: "settings",
    },
    {
      fieldName: "toChain",
      default: "OPTIMISM",
      required: false,
      inputSelector: ChainSelector,
      group: "settings",
    },
    {
      fieldName: "background",
      default: "linear-gradient(90deg, #19194e 0%, #254e78 100%)",
      required: false,
      inputSelector: ColorSelector,
      group: "style",
    },
    {
      fieldName: "fontColor",
      default: "#000000",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "swapItem",
      default: "#cccccc",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "primary",
      default: "#1C3CF1",
      required: false,
      inputSelector: SimpleColorSelector,
      group: "style",
    },
    {
      fieldName: "secondary",
      default: "#1C3CF1",
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
    // {
    //   fieldName: "swapScale",
    //   default: 1,
    //   required: false,
    //   inputSelector: WidthSlider,
    //   group: "style",
    // },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Swap2: React.FC<{ settings: RangoFidgetSettings }> = ({ settings }) => {
  useEffect(() => {
    if (!customElements.get("wcm-button")) {
      import("@rango-dev/provider-walletconnect-2");
    }
  }, []);

  // Configuration variables
  const defaultApiKey =
    process.env.NEXT_PUBLIC_RANGO_API_KEY ||
    "c6381a79-2817-4602-83bf-6a641a409e32";
  const defaultWalletConnectId =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    "e24844c5deb5193c1c14840a7af6a40b";

  const defaultTitle = settings.SwapTitle || "My Swap";
  const defaultAmount = 0.0169;

  // Chain configuration
  const fromChain = settings.fromChain?.toString() || "BASE";
  const toChain = settings.toChain?.toString() || "BASE";
  const defaultSellToken = settings.defaultSellToken || "ETH";
  const defaultBuyToken = settings.defaultBuyToken || "ETH";

  // Theme and style configuration
  const fontFamily = settings.fontFamily || "Londrina Solid";
  const lightColors = {
    background:
      settings.background || "linear-gradient(90deg, #19194e 0%, #254e78 100%)",
    foreground: settings.fontColor || "#000000",
    neutral: settings.swapItem || "#cccccc",
    primary: settings.primary || "#1C3CF1",
    secondary: settings.secondary || "#ffffff",
  };
  const darkColors = {
    background:
      settings.background || "linear-gradient(90deg, #19194e 0%, #254e78 100%)",
    foreground: settings.fontColor || "#ffffff",
    neutral: settings.swapItem || "#666666",
    primary: settings.primary || "#1C3CF1",
    secondary: settings.secondary || "#ffffff",
  };

  const borderRadius = 10;
  const secondaryBorderRadius = 10;

  const themeConfig = {
    mode: "light" as "light",
    fontFamily,
    colors: {
      light: lightColors,
      dark: darkColors,
    },
    borderRadius,
    secondaryBorderRadius,
  };

  // Widget configuration
  const widgetConfig: WidgetConfig = {
    apiKey: defaultApiKey,
    walletConnectProjectId: defaultWalletConnectId,
    title: defaultTitle,
    amount: defaultAmount,
    from: {
      blockchain: fromChain,
      token: {
        blockchain: fromChain,
        symbol: defaultSellToken,
      },
    },
    to: {
      blockchain: toChain,
      token: {
        blockchain: toChain,
        symbol: defaultBuyToken,
      },
    },
    theme: themeConfig,
  };

  // Style configuration for the container
  const containerStyle: React.CSSProperties = {
    overflow: "auto",
    width: "100%",
    height: "100%",
    transform: `scale(${settings.swapScale})`,
    transformOrigin: "top left",
    display: "flex",
    justifyContent: "center",
    borderRadius: settings.borderRadius,
    padding: settings.padding,
    margin: settings.margin,
    backgroundColor: "transparent",
  };

  return (
    <div style={containerStyle}>
      <Widget config={widgetConfig} />
    </div>
  );
};

export default {
  fidget: Swap2,
  properties: rangoProperties,
} as FidgetModule<FidgetArgs<RangoFidgetSettings>>;

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

type RangoFidgetSettings = {
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: number;
  toChain: number;
  background: string;
  fontFamily: string;
  fontColor: string;
  swapScale: number;
} & FidgetSettingsStyle;

const rangoProperties: FidgetProperties = {
  fidgetName: "Swap2",
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
      fieldName: "background",
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

const Swap2: React.FC<{ settings: RangoFidgetSettings }> = ({ settings }) => {
  useEffect(() => {
    // Check and prevent duplicate custom element registration
    if (!customElements.get("wcm-button")) {
      console.log("wcm-button is not defined. Importing provider...");
      import("@rango-dev/provider-walletconnect-2");
    } else {
      console.log("wcm-button already defined. Skipping provider import.");
    }
  }, []);

  const config: WidgetConfig = {
    apiKey:
      process.env.NEXT_PUBLIC_RANGO_API_KEY ||
      "c6381a79-2817-4602-83bf-6a641a409e32",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
      "e24844c5deb5193c1c14840a7af6a40b",
  };

  return (
    <div
      style={{
        overflow: "auto",
        width: "100%",
        height: "100%",
        backgroundColor: settings.background || "transparent",
        transform: `scale(${settings.swapScale})`,
        transformOrigin: "top left",
      }}
    >
      <Widget config={config} />
    </div>
  );
};

export default {
  fidget: Swap2,
  properties: rangoProperties,
} as FidgetModule<FidgetArgs<RangoFidgetSettings>>;

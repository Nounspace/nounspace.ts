import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import ChainSelector from "@/common/components/molecules/ChainSelector";

type MatchaFidgetSettings = {
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: number;
  toChain: number;
  background: string;
  fontFamily: string;
  fontColor: string;
  swapScale: number;
} & FidgetSettingsStyle;

const matchaProperties: FidgetProperties = {
  fidgetName: "Swap",
  icon: 0x1f501,
  fields: [
    {
      fieldName: "defaultSellToken",
      default: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      required: true,
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "defaultBuyToken",
      default: "0x48c6740bcf807d6c47c864faeea15ed4da3910ab",
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
    // {
    //   fieldName: "background",
    //   default: "",
    //   required: false,
    //   inputSelector: SimpleColorSelector,
    //   group: "style",
    // },
    // {
    //   fieldName: "fontFamily",
    //   default: "Londrina Solid",
    //   required: false,
    //   inputSelector: FontSelector,
    //   group: "style",
    // },
    // {
    //   fieldName: "fontColor",
    //   default: "",
    //   required: false,
    //   inputSelector: SimpleColorSelector,
    //   group: "style",
    // },
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

const Swap: React.FC<FidgetArgs<MatchaFidgetSettings>> = ({ settings }) => {
  const matchaBaseUrl = "https://matcha.xyz/trade";

  const buildMatchaUrl = () => {
    const { defaultSellToken, defaultBuyToken, fromChain, toChain } = settings;

    const params = new URLSearchParams();
    if (defaultSellToken) params.append("sellAddress", defaultSellToken);
    if (defaultBuyToken) params.append("buyAddress", defaultBuyToken);
    if (fromChain)
      params.append("sellChain", fromChain.toString().toLowerCase());
    if (toChain) params.append("buyChain", toChain.toString().toLowerCase());
    return `${matchaBaseUrl}?${params.toString()}`;
  };

  // function calculateHeight(value: number) {
  //   const translation = (value - 1) * 30;
  //   return `${translation}%`;
  // }

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
      <iframe
        src={buildMatchaUrl()}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Matcha Swap"
      />
    </div>
  );
};

export default {
  fidget: Swap,
  properties: matchaProperties,
} as FidgetModule<FidgetArgs<MatchaFidgetSettings>>;

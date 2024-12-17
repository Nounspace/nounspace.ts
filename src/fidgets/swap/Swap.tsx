import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import WidthSlider from "@/common/components/molecules/ScaleSliderSelector";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";

type MatchaFidgetSettings = {
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: number;
  toChain: number;
  background: string;
  fontFamily: string;
  fontColor: string;
  swapScale: number;
  optionalFeeRecipient?: string;
  size: number;
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
    // added inout for optional fee recipient
    // {
    //   fieldName: "optionalFeeRecipient",
    //   default: "",
    //   required: false,
    //   inputSelector: TextInput,
    //   group: "settings",
    // },
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
    {
      fieldName: "size",
      required: false,
      inputSelector: IFrameWidthSlider,
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
  const size = settings.size || 1;
  const scaleValue = size;

  return (
    <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <iframe
        src={buildMatchaUrl()}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          transform: `scale(${scaleValue})`,
          transformOrigin: "0 0",
          width: `${100 / scaleValue}%`,
          height: `${100 / scaleValue}%`,
        }}
        className="size-full"
      />
    </div>
  );
};

export default {
  fidget: Swap,
  properties: matchaProperties,
} as FidgetModule<FidgetArgs<MatchaFidgetSettings>>;

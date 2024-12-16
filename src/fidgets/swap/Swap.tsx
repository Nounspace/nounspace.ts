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
    {
      fieldName: "optionalFeeRecipient",
      default: "",
      required: false,
      inputSelector: TextInput,
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

const Swap: React.FC<FidgetArgs<MatchaFidgetSettings>> = ({ settings }) => {
  const matchaBaseUrl = "https://matcha.xyz/trade";

  const buildMatchaUrl = () => {
    const {
      defaultSellToken,
      defaultBuyToken,
      fromChain,
      toChain,
      optionalFeeRecipient,
    } = settings;

    const params = new URLSearchParams();
    if (defaultSellToken) params.append("sellAddress", defaultSellToken);
    if (defaultBuyToken) params.append("buyAddress", defaultBuyToken);
    if (fromChain)
      params.append("sellChain", fromChain.toString().toLowerCase());
    if (toChain) params.append("buyChain", toChain.toString().toLowerCase());

    // Add referral reward parameters if optionalFeeRecipient is provided
    if (optionalFeeRecipient) {
      params.append("ref", optionalFeeRecipient); // Referral address
      params.append("swapFeeBps", "10"); // Example fee percentage in bps (adjust as needed)
    }
    return `${matchaBaseUrl}?${params.toString()}`;
  };

  function calculateHeight(value: number) {
    const translation = (value - 1) * 30;
    const scale = value;
    return `translateY(${translation}%) scale(${scale})`;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: settings.background || "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${settings.swapScale})`,
          transformOrigin: "center",
        }}
      >
        <iframe
          src={buildMatchaUrl()}
          style={{
            width: "480px", // Original iframe width
            height: "660px", // Original iframe height
            border: "none",
          }}
          title="Matcha Swap"
        />
      </div>
    </div>
  );
};

export default {
  fidget: Swap,
  properties: matchaProperties,
} as FidgetModule<FidgetArgs<MatchaFidgetSettings>>;

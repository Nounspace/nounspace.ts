import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import ThemeSelector from "@/common/components/molecules/ThemeSelector";

export type MarketDataProps = {
  chain: { id: string; name: string } | null;
  token: string;
  size: number;
  theme: string;
} & FidgetSettingsStyle;

const frameConfig: FidgetProperties = {
  fidgetName: "Market Data",
  icon: 0x1f4c8,
  fields: [
    {
      fieldName: "chain",
      required: true,
      default: { id: "8453", name: "base" },
      inputSelector: ChainSelector,
      group: "settings",
    },
    {
      fieldName: "token",
      required: true,
      default: "0x0DF1B77aAFEc59E926315e5234db3Fdea419d4E4",
      inputSelector: TextInput,
      group: "settings",
    },
    {
      fieldName: "theme",
      displayName: "Theme",
      inputSelector: ThemeSelector,
      required: false,
      group: "style",
      default: "light",
    },
    ...defaultStyleFields,
    {
      fieldName: "size",
      required: false,
      inputSelector: IFrameWidthSlider,
      group: "style",
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const MarketData: React.FC<FidgetArgs<MarketDataProps>> = ({
  settings: {
    chain = { id: "8453", name: "base" },
    token,
    size = 1,
    theme = "light",
  },
}) => {
  const dexscreenerBaseUrl = "https://dexscreener.com";

  const buildDexScreenerUrl = () => {
    return `${dexscreenerBaseUrl}/${chain?.name ?? "base"}/${token}?embed=1&loadChartSettings=0&trades=0&tabs=1&info=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=${theme}&theme=${theme}&chartStyle=1&chartType=usd&interval=60`;
  };

  const scaleValue = size;

  return (
    <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <iframe
        src={buildDexScreenerUrl()}
        title="DexScreener Market Data"
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
  fidget: MarketData,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<MarketDataProps>>;

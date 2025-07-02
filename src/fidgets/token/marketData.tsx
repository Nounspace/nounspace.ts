import React from "react";
import TextInput from "@/common/components/molecules/TextInput";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import MarketDataSelector from "@/common/components/molecules/MarketDataSelector";
import { FidgetArgs, FidgetProperties, FidgetModule, type FidgetSettingsStyle } from "@/common/fidgets";
import { defaultStyleFields, WithMargin } from "@/fidgets/helpers";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import ThemeSelector from "@/common/components/molecules/ThemeSelector";
import { getDexScreenerUrl, getGeckoIframe } from "@/common/lib/utils/links";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { BsBarChart, BsBarChartFill } from "react-icons/bs";

export type MarketDataProps = {
  chain: { id: string; name: string } | null;
  token: string;
  size: number;
  theme: string;
  dataSource: string;
} & FidgetSettingsStyle;

const frameConfig: FidgetProperties = {
  fidgetName: "Market Data",
  mobileFidgetName: "Chart",
  icon: 0x1f4c8,
  mobileIcon: <BsBarChart size={20} />,
  mobileIconSelected: <BsBarChartFill size={20} />,
  fields: [
    {
      fieldName: "chain",
      displayName: "Chain",
      required: true,
      default: { id: "8453", name: "base" },
      inputSelector: (props) => (
        <WithMargin>
          <ChainSelector {...props} />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "token",
      displayName: "Token",
      required: true,
      default: "0x0DF1B77aAFEc59E926315e5234db3Fdea419d4E4",
      inputSelector: (props) => (
        <WithMargin>
          <TextInput {...props} />
        </WithMargin>
      ),
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
    {
      fieldName: "dataSource",
      displayName: "Data Source",
      inputSelector: (props) => (
        <WithMargin>
          <MarketDataSelector {...props} />
        </WithMargin>
      ),
      required: true,
      group: "settings",
      default: "geckoterminal",
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
  settings: { chain, token, size = 1, theme = "light", dataSource = "dexscreener" },
}) => {
  const [url, setUrl] = React.useState<string | null>(null);

  const buildUrl = () => {
    if (dataSource === "geckoterminal") {
      return getGeckoIframe(token as Address, chain?.name as EtherScanChainName);
    }
    return getDexScreenerUrl(token as Address, chain?.name as EtherScanChainName);
  };

  React.useEffect(() => {
    setUrl(buildUrl());
  }, [chain, token, theme, dataSource]);

  const scaleValue = size;

  return (
    <div style={{ overflow: "hidden", width: "100%" }} className="h-[calc(100dvh-220px)] md:h-full">
      {url && (
        <iframe
          src={url}
          title="Market Data"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          style={{
            transform: `scale(${scaleValue})`,
            transformOrigin: "0 0",
            width: `${100 / scaleValue}%`,
            height: `${100 / scaleValue}%`,
          }}
          className="size-full"
        />
      )}
    </div>
  );
};

export default {
  fidget: MarketData,
  properties: frameConfig,
} as FidgetModule<FidgetArgs<MarketDataProps>>;

import React from "react";
import ChainSelector from "@/common/components/molecules/ChainSelector";
import IFrameWidthSlider from "@/common/components/molecules/IframeScaleSlider";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { BsArrowRepeat } from "react-icons/bs";
import { mobileStyleSettings, WithMargin } from "../helpers";

type MatchaFidgetSettings = {
  defaultSellToken: string;
  defaultBuyToken: string;
  fromChain: { id: string; name: string } | null;
  toChain: { id: string; name: string } | null;
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
  mobileIcon: <BsArrowRepeat size={22} />,
  fields: [
    ...mobileStyleSettings,
    {
      fieldName: "defaultSellToken",
      default: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput
            {...props}
          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "defaultBuyToken",
      default: "0x48c6740bcf807d6c47c864faeea15ed4da3910ab",
      required: true,
      inputSelector: (props) => (
        <WithMargin>
          <TextInput
            {...props}

          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "fromChain",
      default: { id: "8453", name: "Base" },
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ChainSelector
            {...props}

          />
        </WithMargin>
      ),
      group: "settings",
    },
    {
      fieldName: "toChain",
      default: { id: "8453", name: "Base" },
      required: false,
      inputSelector: (props) => (
        <WithMargin>
          <ChainSelector
            {...props}

          />
        </WithMargin>
      ),
      group: "settings",
    },
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

const Swap: React.FC<FidgetArgs<MatchaFidgetSettings>> = ({
  settings: {
    defaultSellToken,
    defaultBuyToken,
    fromChain = { id: "8453", name: "Base" },
    toChain = { id: "8453", name: "Base" },
    optionalFeeRecipient,
    size = 1,
  },
}) => {
  const matchaBaseUrl = "https://matcha.xyz/trade";
  const [url, setUrl] = React.useState("");

  const buildMatchaUrl = () => {
    const params = new URLSearchParams();
    if (defaultSellToken) params.append("sellAddress", defaultSellToken);
    if (defaultBuyToken) params.append("buyAddress", defaultBuyToken);
    if (fromChain && fromChain.id) {
      params.append("sellChain", fromChain.id);
    }
    if (toChain && toChain.id) {
      params.append("buyChain", toChain.id);
    }
    if (optionalFeeRecipient)
      params.append("feeRecipient", optionalFeeRecipient);
    return `${matchaBaseUrl}?${params.toString()}`;
  };

  React.useEffect(() => {
    setUrl(buildMatchaUrl());
  }, [
    defaultSellToken,
    defaultBuyToken,
    fromChain,
    toChain,
    optionalFeeRecipient,
  ]);

  const scaleValue = size;

  React.useEffect(() => {
    let currentScrollY = window.scrollY;
    let preventScroll = false;

    const handleScroll = () => {
      if (preventScroll && window.scrollY !== currentScrollY) {
        window.scrollTo(0, currentScrollY);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === "connectWallet") {
        preventScroll = true;
        currentScrollY = window.scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div style={{ overflow: "hidden", width: "100%" }} className="h-[calc(100dvh-220px)] md:h-full">
      <iframe
        src={url}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          transform: `scale(${scaleValue})`,
          transformOrigin: "0 0",
          width: `${100 / scaleValue}%`,
          height: `${100 / scaleValue}%`,
          overflow: "hidden",
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

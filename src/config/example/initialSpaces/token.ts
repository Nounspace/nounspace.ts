import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";
import { EtherScanChainName } from "../../../constants/etherscanChainIds";
import { getGeckoUrl } from "@/common/lib/utils/links";
import { Address } from "viem";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";

export const createInitialTokenSpaceConfigForAddress = (
  address: Address,
  network: EtherScanChainName,
  castHash?: string,
  casterFid?: number,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Token"];

  config.fidgetInstanceDatums = {
    "market:token-market": {
      config: {
        data: {},
        editable: true,
        settings: {
          tokenAddress: address,
          network: network,
          geckoUrl: getGeckoUrl(address, network),
        },
      },
      fidgetType: "market",
      id: "market:token-market",
    },
    "text:token-info": {
      config: {
        data: {},
        editable: false,
        settings: {
          content: "Token information and market data",
          fontSize: "16px",
          textAlign: "center"
        },
      },
      fidgetType: "text",
      id: "text:token-info",
    },
  };

  const layoutItems = [
    {
      w: 6,
      h: 8,
      x: 0,
      y: 0,
      i: "market:token-market",
      minW: 4,
      maxW: 36,
      minH: 6,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 8,
      x: 7,
      y: 0,
      i: "text:token-info",
      minW: 4,
      maxW: 36,
      minH: 6,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  if (castHash && casterFid) {
    config.fidgetInstanceDatums["cast:example-cast"] = {
      config: {
        data: {},
        editable: true,
        settings: {
          background: "var(--user-theme-fidget-background)",
          castHash: castHash,
          casterFid: casterFid,
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "cast",
      id: "cast:example-cast",
    };
    layoutItems.push({
      w: 12,
      h: 6,
      x: 0,
      y: 8,
      i: "cast:example-cast",
      minW: 4,
      maxW: 36,
      minH: 4,
      maxH: 36,
      moved: false,
      static: false,
    });
  }

  // Set the layout configuration
  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;

  return config;
};

export default createInitialTokenSpaceConfigForAddress;

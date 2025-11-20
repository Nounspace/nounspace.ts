import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";
import { getNetworkWithId } from "@/common/lib/utils/networks";
import { EtherScanChainName } from "../../../constants/etherscanChainIds";
import { getGeckoUrl } from "@/common/lib/utils/links";
import { Address } from "viem";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";

export const createInitialTokenSpaceConfigForAddress = (
  address: string,
  castHash: string | null,
  casterFid: string | null,
  symbol: string,
  isFeaturedToken: boolean,
  network: EtherScanChainName = "base",
  ownerAddress?: Address,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Token"];

  const layoutItems = [
    {
      w: 4,
      h: 7,
      x: 0,
      y: 0,
      i: "Swap:gnars-token-swap",
      minW: 3,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 4,
      h: 7,
      x: 4,
      y: 0,
      i: "Market:gnars-token-market",
      minW: 3,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 4,
      h: 7,
      x: 8,
      y: 0,
      i: "Directory:gnars-token-holders",
      minW: 3,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 6,
      x: 0,
      y: 7,
      i: "feed:gnars-token-feed",
      minW: 4,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 6,
      x: 6,
      y: 7,
      i: "links:gnars-token-links",
      minW: 4,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  config.fidgetInstanceDatums = {
    "Swap:gnars-token-swap": {
      config: {
        data: {},
        editable: true,
        settings: {
          defaultBuyToken: address,
          defaultSellToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          fromChain: getNetworkWithId(network),
          toChain: getNetworkWithId(network),
          size: 1,
        },
      },
      fidgetType: "Swap",
      id: "Swap:gnars-token-swap",
    },
    "Market:gnars-token-market": {
      config: {
        data: {},
        editable: true,
        settings: {
          chain: getNetworkWithId(network),
          token: address,
          dataSource: "geckoterminal",
          theme: "light",
          size: 1,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "Market",
      id: "Market:gnars-token-market",
    },
    "Directory:gnars-token-holders": {
      config: {
        data: {},
        editable: true,
        settings: {
          source: "tokenHolders",
          contractAddress: address,
          network: network,
          include: "holdersWithFarcasterAccount",
          layoutStyle: "cards",
          assetType: "token",
          sortBy: "tokenHoldings",
        },
      },
      fidgetType: "Directory",
      id: "Directory:gnars-token-holders",
    },
    "feed:gnars-token-feed": {
      config: {
        data: {},
        editable: true,
        settings: {
          feedType: "filter",
          filterType: "keyword",
          keyword: symbol ? symbol.replace("$", "#") : "#gnars",
          fontFamily: "var(--user-theme-font)",
          fontColor: "var(--user-theme-font-color)",
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "feed",
      id: "feed:gnars-token-feed",
    },
    "links:gnars-token-links": {
      config: {
        data: {},
        editable: true,
        settings: {
          title: `${symbol || "$TOKEN"} resources`,
          links: [
            {
              title: "BaseScan",
              url: `https://basescan.org/address/${address}`,
            },
            {
              title: "GeckoTerminal",
              url: getGeckoUrl(address as Address, network),
            },
            {
              title: "Nouns Center",
              url: "https://nouns.center/dao/gnars",
            },
          ],
        },
      },
      fidgetType: "links",
      id: "links:gnars-token-links",
    },
  };

  if (isFeaturedToken && castHash && casterFid) {
    config.fidgetInstanceDatums["cast:gnars-token-cast"] = {
      config: {
        data: {},
        editable: true,
        settings: {
          castHash,
          casterFid,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "cast",
      id: "cast:gnars-token-cast",
    };
    layoutItems.push({
      w: 12,
      h: 6,
      x: 0,
      y: 13,
      i: "cast:gnars-token-cast",
      minW: 4,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    });
  }

  if (ownerAddress) {
    config.fidgetInstanceDatums["Chat:gnars-token-chat"] = {
      config: {
        data: {},
        editable: true,
        settings: {
          roomName: `${symbol || address}-chat`,
          roomOwnerAddress: ownerAddress,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "Chat",
      id: "Chat:gnars-token-chat",
    };
    layoutItems.push({
      w: 12,
      h: 6,
      x: 0,
      y: isFeaturedToken && castHash && casterFid ? 19 : 13,
      i: "Chat:gnars-token-chat",
      minW: 4,
      minH: 4,
      maxW: 36,
      maxH: 36,
      moved: false,
      static: false,
    });
  }

  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;

  return config;
};

export default createInitialTokenSpaceConfigForAddress;

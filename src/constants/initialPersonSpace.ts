import { SpaceConfig } from "@/app/(spaces)/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";

export const INITIAL_SPACE_CONFIG_EMPTY: Omit<SpaceConfig, "isEditable"> = {
  layoutID: "",
  layoutDetails: {
    layoutConfig: {
      layout: [],
    },
    layoutFidget: "grid",
  },
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  fidgetTrayContents: [],
};

const createIntialPersonSpaceConfigForFid = (
  fid: number,
  username?: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    "feed:profile": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          users: fid,
          filterType: FilterType.Fids,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:profile",
    },
    "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e": {
      config: {
        editable: false,
        settings: {
          trackType: "farcaster",
          farcasterUsername: username ?? "",
          walletAddresses: "",
        },
        data: {},
      },
      fidgetType: "Portfolio",
      id: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
    },
  };
  config.layoutDetails.layoutConfig.layout.push({
    w: 5,
    h: 8,
    x: 0,
    y: 0,
    i: "feed:profile",
    minW: 4,
    maxW: 36,
    minH: 6,
    maxH: 36,
    moved: false,
    static: false,
  });
  config.layoutDetails.layoutConfig.layout.push({
    w: 5,
    h: 6,
    x: 0,
    y: 8,
    i: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
    minW: 3,
    maxW: 36,
    minH: 3,
    maxH: 36,
    moved: false,
    static: false,
  });
  return config;
};

export default createIntialPersonSpaceConfigForFid;

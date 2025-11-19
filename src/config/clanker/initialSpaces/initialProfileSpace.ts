import { SpaceConfig } from "@/app/(spaces)/Space";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";

// Set default tabNames for profile spaces
const INITIAL_PROFILE_SPACE_CONFIG = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
INITIAL_PROFILE_SPACE_CONFIG.tabNames = ["Profile"];

const createInitialProfileSpaceConfigForFid = (
  fid: number,
  username?: string,
  walletAddress?: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_PROFILE_SPACE_CONFIG);
  config.fidgetInstanceDatums = {
    "feed:profile": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          users: fid,
          filterType: FilterType.Fids,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
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
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
        data: {},
      },
      fidgetType: "Portfolio",
      id: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
    },
    "BuilderScore:builder-score": {
      config: {
        editable: false,
        settings: {
          fid: fid.toString(),
          darkMode: false,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
        data: {},
      },
      fidgetType: "BuilderScore",
      id: "BuilderScore:builder-score",
    },
    "Top8:top8": {
      config: {
        editable: false,
        settings: {
          username: username ?? "",
          size: 0.6,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
        data: {},
      },
      fidgetType: "Top8",
      id: "Top8:top8",
    },
  };
  const layoutItems = [
    {
      w: 4,
      h: 8,
      x: 0,
      y: 0,
      i: "feed:profile",
      minW: 4,
      maxW: 36,
      minH: 2,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 4,
      h: 8,
      x: 4,
      y: 0,
      i: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
      minW: 3,
      maxW: 36,
      minH: 3,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 4,
      h: 3,
      x: 8,
      y: 0,
      i: "BuilderScore:builder-score",
      minW: 3,
      maxW: 36,
      minH: 2,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 4,
      h: 5,
      x: 8,
      y: 3,
      i: "Top8:top8",
      minW: 4,
      maxW: 36,
      minH: 5,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  // Set the layout configuration
  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  // Set default tab names
  config.tabNames = ["Profile"];
  
  return config;
};

export default createInitialProfileSpaceConfigForFid;

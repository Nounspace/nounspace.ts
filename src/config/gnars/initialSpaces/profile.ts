import { SpaceConfig } from "@/app/(spaces)/Space";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";

const INITIAL_PROFILE_SPACE_CONFIG = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
INITIAL_PROFILE_SPACE_CONFIG.tabNames = ["Profile"];

const createInitialProfileSpaceConfigForFid = (
  fid: number,
  username?: string,
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
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:profile",
    },
    "text:gnars-profile": {
      config: {
        editable: false,
        settings: {
          content: `Welcome to your Gnars space${username ? `, ${username}` : ""}! Share clips, organize sessions, and invite fellow riders to the treasury-backed playground.`,
          fontSize: "18px",
          textAlign: "left",
        },
        data: {},
      },
      fidgetType: "text",
      id: "text:gnars-profile",
    },
    "links:gnars-kit": {
      config: {
        editable: false,
        settings: {
          title: "Rider Toolkit",
          links: [
            { title: "Apply for a grant", url: "https://airtable.com/apppxNTUjEC2zYoyv/shrP0uCSmS7AYA9Y9" },
            { title: "Treasury on Nouns Center", url: "https://nouns.center/dao/gnars" },
            { title: "Discord server", url: "https://discord.gg/gnars" },
          ],
        },
        data: {},
      },
      fidgetType: "links",
      id: "links:gnars-kit",
    },
  };

  const layoutItems = [
    {
      w: 6,
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
    },
    {
      w: 3,
      h: 6,
      x: 6,
      y: 0,
      i: "text:gnars-profile",
      minW: 3,
      maxW: 36,
      minH: 3,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 3,
      h: 6,
      x: 9,
      y: 0,
      i: "links:gnars-kit",
      minW: 3,
      maxW: 36,
      minH: 3,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;
  config.tabNames = ["Profile"];

  return config;
};

export default createInitialProfileSpaceConfigForFid;

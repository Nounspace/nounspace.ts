import { SpaceConfig } from "@/app/(spaces)/Space";
import { FilterType, FeedType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../initialSpaceConfig";

const INITIAL_CHANNEL_SPACE_CONFIG = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
INITIAL_CHANNEL_SPACE_CONFIG.tabNames = ["Channel"];

const createInitialChannelSpaceConfig = (
  channelId: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_CHANNEL_SPACE_CONFIG);

  config.fidgetInstanceDatums = {
    "feed:channel": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          filterType: FilterType.ChannelId,
          channel: channelId,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:channel",
    },
  };

  const layoutItems = [
    {
      w: 6,
      h: 8,
      x: 0,
      y: 0,
      i: "feed:channel",
      minW: 4,
      maxW: 20,
      minH: 6,
      maxH: 12,
      moved: false,
      static: false,
    },
  ];

  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;

  config.tabNames = ["Channel"];

  return config;
};

export default createInitialChannelSpaceConfig;

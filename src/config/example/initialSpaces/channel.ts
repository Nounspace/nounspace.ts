import { SpaceConfig } from "@/app/(spaces)/Space";
import { FilterType, FeedType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";

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
    "text:channel-info": {
      config: {
        editable: false,
        settings: {
          content: "Welcome to this Example Community channel!",
          fontSize: "16px",
          textAlign: "center"
        },
        data: {},
      },
      fidgetType: "text",
      id: "text:channel-info",
    },
  };

  const layoutItems = [
    {
      w: 12,
      h: 8,
      x: 0,
      y: 0,
      i: "text:channel-info",
      minW: 4,
      maxW: 20,
      minH: 2,
      maxH: 6,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 8,
      x: 0,
      y: 8,
      i: "feed:channel",
      minW: 4,
      maxW: 20,
      minH: 6,
      maxH: 12,
      moved: false,
      static: false,
    },
  ];

  // Set the layout configuration
  const layoutConfig = getLayoutConfig(config.layoutDetails);
  layoutConfig.layout = layoutItems;

  // Set default tab names
  config.tabNames = ["Channel"];

  return config;
};

export default createInitialChannelSpaceConfig;

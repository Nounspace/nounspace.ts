import { SpaceConfig } from "@/app/(spaces)/Space";
import { FeedType, FilterType } from "@neynar/nodejs-sdk/build/api";
import { cloneDeep } from "lodash";
import { getLayoutConfig } from "@/common/utils/layoutFormatUtils";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialSpaceConfig";

// Set default tabNames for channel spaces
const INITIAL_CHANNEL_SPACE_CONFIG = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
INITIAL_CHANNEL_SPACE_CONFIG.tabNames = ["Channel"];

const createInitialChannelSpaceConfigForName = (
  channelName: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_CHANNEL_SPACE_CONFIG);
  config.fidgetInstanceDatums = {
    "feed:channel": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          filterType: FilterType.ChannelId,
          channel: channelName,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:channel",
    },
  };
  const layoutItems = [
    {
      w: 12,
      h: 8,
      x: 0,
      y: 0,
      i: "feed:channel",
      minW: 4,
      maxW: 36,
      minH: 6,
      maxH: 36,
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

export default createInitialChannelSpaceConfigForName;

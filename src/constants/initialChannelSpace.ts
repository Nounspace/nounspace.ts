import { SpaceConfig } from "@/app/(spaces)/Space";
import { FeedType } from "@neynar/nodejs-sdk/build/api";
import { FilterType } from "@/fidgets/farcaster/Feed";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";

export const createInitialChannelSpaceConfigForName = (
  channelName: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    "feed:channel": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          filterType: FilterType.Channel,
          channel: channelName,
          selectPlatform: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:channel",
    },
  };
  config.layoutDetails.layoutConfig.layout.push({
    w: 6,
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
  });
  return config;
};

export default createInitialChannelSpaceConfigForName;

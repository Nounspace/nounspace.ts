import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { FeedType } from "@neynar/nodejs-sdk/build/api";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";
import { FilterType } from "@/fidgets/farcaster/Feed";

export const createInitialChannelSpaceConfig = (
  channel: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    "feed:channel": {
      config: {
        editable: false,
        settings: {
          selectPlatform: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
          feedType: FeedType.Filter,
          filterType: FilterType.Channel,
          channel,
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

export default createInitialChannelSpaceConfig;

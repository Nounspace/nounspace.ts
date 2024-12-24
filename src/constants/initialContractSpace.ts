import { SpaceConfig } from "@/common/components/templates/Space";
import { FeedType, FilterType } from "@neynar/nodejs-sdk";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";

const createInitialContractSpaceConfigForAddress = (
  address: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    // "feed:profile": {
    //   config: {
    //     editable: false,
    //     settings: {
    //       feedType: FeedType.Filter,
    //       users: fid,
    //       filterType: FilterType.Fids,
    //     },
    //     data: {},
    //   },
    //   fidgetType: "feed",
    //   id: "feed:profile",
    // },
  };
  // config.layoutDetails.layoutConfig.layout.push({
  //   w: 5,
  //   h: 8,
  //   x: 0,
  //   y: 0,
  //   i: "feed:profile",
  //   minW: 4,
  //   maxW: 36,
  //   minH: 6,
  //   maxH: 36,
  //   moved: false,
  //   static: false,
  // });
  return config;
};

export default createInitialContractSpaceConfigForAddress;

import { SpaceConfig } from "@/common/components/templates/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FeedType, FilterType } from "@neynar/nodejs-sdk";

const createIntialPersonSpaceConfigForFid = (
  fid: number,
): Omit<SpaceConfig, "isEditable"> => {
  return {
    layoutID: "",
    layoutDetails: {
      layoutConfig: {
        layout: [
          {
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
          },
        ],
      },
      layoutFidget: "grid",
    },
    theme: DEFAULT_THEME,
    fidgetInstanceDatums: {
      "feed:profile": {
        config: {
          editable: false,
          settings: {
            feedType: FeedType.Filter,
            users: fid,
            FilterType: FilterType.Fids,
          },
          data: {},
        },
        fidgetType: "feed",
        id: "feed:profile",
      },
    },
    fidgetTrayContents: [],
  };
};

export default createIntialPersonSpaceConfigForFid;

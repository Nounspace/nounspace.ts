import { SpaceConfig } from "@/common/components/templates/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FeedType } from "@neynar/nodejs-sdk";

const createIntialPersonSpaceConfigForFid = (
  fid: number,
): Omit<SpaceConfig, "isEditable"> => {
  return {
    layoutID: "",
    layoutDetails: {
      layoutConfig: {
        layout: [
          {
            w: 3,
            h: 2,
            x: 0,
            y: 0,
            i: "feed:profile",
            minW: 4,
            maxW: 36,
            minH: 6,
            maxH: 36,
            moved: false,
            static: true,
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

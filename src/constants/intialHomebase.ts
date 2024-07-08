import { SpaceConfig } from "@/common/components/templates/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FeedType } from "@neynar/nodejs-sdk";

const layoutID = "";
const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
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
          feedType: FeedType.Following,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:profile",
    },
  },
  isEditable: true,
  fidgetTrayContents: [],
};

export default INITIAL_HOMEBASE_CONFIG;

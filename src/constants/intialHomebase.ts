import { SpaceConfig } from "@/common/components/templates/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { FeedType } from "@neynar/nodejs-sdk";

const layoutID = "";
const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails: {
    layoutConfig: {
      layout: [],
    },
    layoutFidget: "grid",
  },
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  isEditable: true,
  fidgetTrayContents: [],
};

export default INITIAL_HOMEBASE_CONFIG;

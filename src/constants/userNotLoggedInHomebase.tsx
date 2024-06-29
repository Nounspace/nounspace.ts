import { SpaceConfig } from "@/common/components/templates/Space";
import { LayoutFidgetConfig, LayoutFidgetDetails } from "@/common/fidgets";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const layoutID = "";
const layoutDetails: LayoutFidgetDetails<LayoutFidgetConfig<any[]>> = {
  layoutConfig: { layout: [] },
  layoutFidget: "grid",
};

const USER_NOT_LOGGED_IN_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails,
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  isEditable: false,
  fidgetTrayContents: [],
};

export default USER_NOT_LOGGED_IN_HOMEBASE_CONFIG;

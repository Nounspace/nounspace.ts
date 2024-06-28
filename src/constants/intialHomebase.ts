import { SpaceConfig } from "@/common/components/templates/Space";
import { LayoutFidgetConfig, LayoutFidgetDetails } from "@/common/fidgets";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const layoutID = "";
const layoutDetails: LayoutFidgetDetails<LayoutFidgetConfig<any[]>> = {
  layoutConfig: { layout: [] },
  layoutFidget: "grid",
};

const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails,
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  isEditable: true,
  fidgetTrayContents: [],
};

export default INITIAL_HOMEBASE_CONFIG;

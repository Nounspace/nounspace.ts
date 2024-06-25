import { SpaceConfig } from "@/common/components/templates/Space";
import { LayoutFidgetDetails } from "@/common/fidgets";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const layoutID = "";
const layoutDetails: LayoutFidgetDetails = {
  layoutConfig: { layout: [] },
  layoutFidget: "grid",
};

const INITIAL_PERSONAL_SPACE_CONFIG: Omit<SpaceConfig, "isEditable"> = {
  layoutID,
  layoutDetails,
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  fidgetTrayContents: [],
};

export default INITIAL_PERSONAL_SPACE_CONFIG;

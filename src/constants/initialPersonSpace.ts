import { SpaceConfig } from "@/common/components/templates/Space";
import { LayoutFidgetDetails } from "@/common/fidgets";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const layoutID = "";
const layoutDetails: LayoutFidgetDetails = {
  layoutConfig: { layout: [] },
  layoutFidget: "grid",
};

const INITIAL_PERSONAL_SPACE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails,
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  isEditable: true,
  fidgetTrayContents: [],
};

export default INITIAL_PERSONAL_SPACE_CONFIG;

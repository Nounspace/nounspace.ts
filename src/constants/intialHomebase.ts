import { SpaceConfig } from "@/common/components/templates/Space";
import { LayoutFidgetDetails } from "@/common/fidgets";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
import { GridLayout } from "@/fidgets/layout/Grid";

const gridDetails: GridLayout = {
  isDraggable: false,
  isResizable: false,
  items: 4,
  cols: 12,
  rowHeight: 70,
  // This turns off compaction so you can place items wherever.
  compactType: null,
  // This turns off rearrangement so items will not be pushed arround.
  preventCollision: true,
  maxRows: 9,
  layout: [],
  isBounded: false,
  margin: [16, 16],
  containerPadding: [0, 0],
};
const layoutID = "";
const layoutDetails: LayoutFidgetDetails = {
  layoutConfig: gridDetails,
  layoutFidget: "grid",
};

const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails,
  theme: DEFAULT_THEME,
  fidgetConfigs: {},
  isEditable: true,
};

export default INITIAL_HOMEBASE_CONFIG;

import { SpaceConfig } from "@/app/(spaces)/Space";

export const INITIAL_SPACE_CONFIG_EMPTY: Omit<SpaceConfig, "isEditable"> = {
  fidgetInstanceDatums: {},
  layoutID: "empty-layout",
  layoutDetails: {
    layoutConfig: {
      layout: []
    },
    layoutFidget: "grid"
  },
  fidgetTrayContents: [],
  theme: {
    id: "default",
    name: "Default",
    properties: {
      font: "Inter",
      fontColor: "#000000",
      headingsFont: "Inter",
      headingsFontColor: "#000000",
      background: "#ffffff",
      backgroundHTML: "",
      musicURL: "",
      fidgetBackground: "#ffffff",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "#C0C0C0",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  timestamp: new Date().toISOString(),
  tabNames: []
};

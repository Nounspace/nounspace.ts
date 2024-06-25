import { SpaceConfig } from "@/common/components/templates/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

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
            i: "text:profile",
            minW: 3,
            maxW: 36,
            minH: 2,
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
      "text:profile": {
        config: {
          editable: false,
          settings: {
            title: `User ${fid}`,
            text: `THE USER YOUR ARE LOOKING AT HAS AN FID: ${fid}`,
            fontFamily: "var(--user-theme-font)",
          },
          data: {},
        },
        fidgetType: "text",
        id: "text:profile",
      },
    },
    fidgetTrayContents: [],
  };
};

export default createIntialPersonSpaceConfigForFid;

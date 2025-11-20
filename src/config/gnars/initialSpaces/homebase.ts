import { SpaceConfig } from "@/app/(spaces)/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const tutorialText = `
### 🛹 Welcome to your Gnars homebase

- Click the paintbrush in the bottom-left corner to enter Customization Mode.
- Drag fidgets into place, resize them, and stash anything you're not using.
- Use the Theme panel to dial in a sunset gradient, neon night session, or minimalist studio background.
- Need a soundtrack? Drop in a music fidget or embed your latest riding playlist.

#### Quick Links
- **Daily auction:** https://gnars.wtf
- **Grants:** https://airtable.com/apppxNTUjEC2zYoyv/shrP0uCSmS7AYA9Y9
- **Community:** https://discord.gg/gnars

Stack clips, dashboards, and proposals however you like—this canvas is fueled by the Gnars treasury.
`;

const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID: "gnars-homebase-layout",
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          w: 12,
          h: 10,
          x: 0,
          y: 0,
          i: "text:gnars-homebase",
          moved: false,
          static: false,
        },
      ],
    },
    layoutFidget: "grid",
  },
  fidgetInstanceDatums: {
    "text:gnars-homebase": {
      config: {
        editable: false,
        settings: {
          content: tutorialText,
          fontSize: "15px",
          textAlign: "left",
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
        data: {},
      },
      fidgetType: "text",
      id: "text:gnars-homebase",
    },
  },
  fidgetTrayContents: [],
  theme: DEFAULT_THEME,
  tabNames: ["Homebase"],
  isEditable: true,
};

export default INITIAL_HOMEBASE_CONFIG;

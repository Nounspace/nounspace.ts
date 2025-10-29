import { SpaceConfig } from "@/app/(spaces)/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";

const tutorialText = `
### 🖌️ Click the paintbrush in the bottom-left corner to open Customization Mode

### Add Fidgets
1. Click the blue **+** button.
2. Drag a Fidget to an open spot on the grid.
3. Click Save

(after saving, scroll down here for more instructions)

### Customize Fidgets
1. From customization mode, click any Fidget on the grid to open its settings.
2. Click 'Style' to customize a fidget's look. Any Fidget styles set to "Theme" inherit their look from the Tab's theme.  

### Arrange Fidgets
- **Move:** Drag from the center
- **Resize:** Drag from an edge or corner
- **Stash in Fidget Tray:** Click a fidget then click ⇱ to save it for later.
- **Delete:** Click a fidget then click X it to delete it forever.

### Create New Tabs
1. Click the **+** button in the tab bar to create a new tab.
2. Name your tab and click Save.
3. Add fidgets to your new tab!

### Themes
Click the paintbrush icon to open customization mode, then click the **Theme** button to change your space's appearance.

### Need Help?
Visit our documentation or join our community for support!

---

**Welcome to Example Community!** This is your personal space where you can organize fidgets however you'd like.
`;

const INITIAL_HOMEBASE_CONFIG: Omit<SpaceConfig, "isEditable"> = {
  fidgetInstanceDatums: {
    "text:tutorial": {
      config: {
        data: {},
        editable: false,
        settings: {
          content: tutorialText,
          fontSize: "14px",
          textAlign: "left",
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "text",
      id: "text:tutorial",
    },
  },
  layoutID: "homebase-layout",
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          w: 12,
          h: 12,
          x: 0,
          y: 0,
          i: "text:tutorial",
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
  fidgetTrayContents: [],
  theme: DEFAULT_THEME,
  timestamp: new Date().toISOString(),
  tabNames: ["Homebase"],
};

export default INITIAL_HOMEBASE_CONFIG;

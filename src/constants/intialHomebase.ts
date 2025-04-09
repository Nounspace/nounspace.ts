import { SpaceConfig } from "@/app/(spaces)/Space";
import DEFAULT_THEME from "@/common/lib/theme/defaultTheme";
const tutorialText = `
 ## To start customizing, click the paintbrush in the bottom left next to 'Cast' ⬋🖌️⬋

### Add Fidgets
From customization mode, click the big blue **+** button. Then, drag a Fidget to an open spot on the grid. Finally, click Save so you can scroll down here for more instructions. 

![DragFidget-ezgif.com-loop-count](https://hackmd.io/_uploads/S1MTNDTsC.gif)

scroll down for more ⬇️ ⬇️ ⬇️ 

### Customize Fidgets
Click any Fidget on the grid to open its settings. In addition to configuring each Fidget's settings, you can customize its look in the 'Style' tab. Any Fidget style parameters set to "Theme" inherit their look from the theme of their Tab.  

![EditFidget-ezgif.com-loop-count](https://hackmd.io/_uploads/r1pTND6s0.gif)

### Arrange Fidgets
- **Move:** Click and drag fidgets from the middle to move them
![move fidget](https://nounspace.mypinata.cloud/ipfs/QmYWvdpdiyKwjVAqjhcFTBkiTUnc8rF4p2EGg3C4sTRsr6)
- **Resize:** Click and drag fidgets' edges to resize them
![2024-08-28 21.05.59](https://hackmd.io/_uploads/ryxADUpjC.gif)
- **Stash in Fidget Tray:** Click a fidget then click the ⇱ icon above it to save it in your Fidget Tray for later.
![image](https://hackmd.io/_uploads/Syz8wUajC.png)
- **Delete:** Click a fidget then click the X icon above it to delete it forever.
![image](https://hackmd.io/_uploads/SyhwvLpoR.png)

### Customize Theme
- **Templates:** One quick and easy option is to select a template. Then if you'd like, you can further customize to make it your own.
- **Style:** Set a background color or gradient for each Tab, or set the default color, border, and shadows for all Fidgets on the selected Tab.
- **Fonts:** Set the default header and body fonts for Fidgets on your space.
- **Code:** Add HTML/CSS to fully customize your space's background. 

![Edit Theme](https://hackmd.io/_uploads/Sk7sWw6sC.gif)

### Customize Music
Last but not least, search for or paste the link to any song or playlist on YouTube to play it for yourself on your homebase or on your space for your friends.

### Homebase vs. Space
**Your Homebase** is a private space that only you can see.

**Your Space** is your public profile that everyone can see.

You can use the same Fidgets and tricks to customize them both. Use your **Homebase** to access the content, communities, and functionality that you love, and use your **Space** to share the content and functionality you love with your friends.

`;
const onboardingFidgetID = "text:onboarding";
const onboardingFidgetConfig = {
  config: {
    editable: true,
    settings: {
      title: "Welcome to Nounspace! 🚀 👾",
      text: tutorialText,
      urlColor: "blue",
      fontFamily: "Londrina Solid",
      fontColor: "#073b4c",
      headingsFontFamily: "Londrina Solid",
      headingsFontColor: "#2563ea",
      backgroundColor: "#06d6a0",
      borderColor: "#ffd166",
    },
    data: {},
  },
  fidgetType: "text",
  id: onboardingFidgetID,
};

const layoutID = "";
const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID,
  layoutDetails: {
    layoutConfig: {
      layout: [
        // Existing layouts can go here, e.g., feed, profile, etc.
        {
          w: 6,
          h: 7,
          x: 8,
          y: 3,
          i: onboardingFidgetID,
          moved: false,
          static: false,
        },
      ],
    },
    layoutFidget: "grid",
  },
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {
    [onboardingFidgetID]: onboardingFidgetConfig,
  },
  isEditable: true,
  fidgetTrayContents: [],
};

export default INITIAL_HOMEBASE_CONFIG;

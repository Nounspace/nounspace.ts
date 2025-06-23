import { SpaceConfig } from "@/app/(spaces)/Space";

export const NOUNS_TAB_CONFIG = {
  "layoutID": "88b78f73-37fb-4921-9410-bc298311c0bb",
  "layoutDetails": {
    "layoutConfig": {
      "layout": [
        {
          "w": 12,
          "h": 10,
          "x": 0,
          "y": 0,
          "i": "iframe:d96fd12e-9006-4e48-bf0f-8124cd73df26",
          "minW": 2,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        }
      ]
    },
    "layoutFidget": "grid"
  },
  "theme": {
    "id": "Homebase-Tab 4 - 1-Theme",
    "name": "Homebase-Tab 4 - 1-Theme",
    "properties": {
      "background": "#ffffff",
      "backgroundHTML": "",
      "fidgetBackground": "#ffffff",
      "fidgetBorderColor": "#eeeeee",
      "fidgetBorderRadius": "0px",
      "fidgetBorderWidth": "0px",
      "fidgetShadow": "none",
      "font": "Inter",
      "fontColor": "#000000",
      "gridSpacing": "0",
      "headingsFont": "Inter",
      "headingsFontColor": "#000000",
      "musicURL": "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804"
    }
  },
  "fidgetInstanceDatums": {
    "iframe:d96fd12e-9006-4e48-bf0f-8124cd73df26": {
      "config": {
        "data": {},
        "editable": true,
        "settings": {
          "background": "var(--user-theme-fidget-background)",
          "cropOffsetX": 0,
          "cropOffsetY": -4,
          "fidgetBorderColor": "rgba(238, 238, 238, 0)",
          "fidgetBorderWidth": "0",
          "fidgetShadow": "none",
          "isScrollable": false,
          "showOnMobile": true,
          "url": "https://www.nouns.com"
        }
      },
      "fidgetType": "iframe",
      "id": "iframe:d96fd12e-9006-4e48-bf0f-8124cd73df26"
    }
  },
  "fidgetTrayContents": [],
  "isEditable": false,
  "timestamp": "2025-06-20T05:58:44.080Z"
};

export const SOCIAL_TAB_CONFIG: SpaceConfig = {
  "layoutID": "48073f43-70dd-459c-be6d-e31ac89f267f",
  "layoutDetails": {
    "layoutConfig": {
      "layout": [
        {
          "w": 8,
          "h": 10,
          "x": 0,
          "y": 0,
          "i": "feed:9f8f8e69-6323-4e7d-8f9a-210f522827f7",
          "minW": 4,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        },
        {
          "w": 4,
          "h": 4,
          "x": 8,
          "y": 6,
        "i": "links:c96c96c9-c19d-47c7-b24d-b11985671470",
        "minW": 2,
        "maxW": 36,
        "minH": 2,
        "maxH": 36,
        "moved": false,
        "static": false,
        "resizeHandles": [
          "s",
          "w",
          "e",
          "n",
          "sw",
          "nw",
          "se",
          "ne"
        ],
        "isBounded": false
        },
        {
          "w": 4,
          "h": 6,
          "x": 8,
          "y": 0,
          "i": "feed:Ns29YIhpl9SWpf5O36d2",
          "minW": 2,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        }
      ]
    },
    "layoutFidget": "grid"
  },
  "theme": {
    "id": "Homebase-Tab 3-Theme",
    "name": "Homebase-Tab 3-Theme",
    "properties": {
      "background": "#ffffff",
      "backgroundHTML": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Nouns DAO Fun Animated Background</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .background {
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        160deg,
        #FCCD04 0%,
        #E80173 20%,
        #45AAF2 40%,
        #23D160 60%,
        #FDB900 80%,
        #C8A2C8 100%
      );
      background-size: 400% 400%;
      animation: gradientFlow 30s ease-in-out infinite;
    }

    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .noggles {
      position: absolute;
      bottom: -15%;
      width: 60px;
      height: 60px;
      background-image: url("https://nouns.wtf/brand-assets/color_noggles.png");
      background-repeat: no-repeat;
      background-size: contain;
      opacity: 0;
      animation-name: floatUp;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
    }

    @keyframes floatUp {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(-120vh) rotate(1080deg); opacity: 0; }
    }

    .noggles:nth-child(1) { left: 5%; animation-duration: 8s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(2) { left: 15%; animation-duration: 9s; animation-delay: 2s; animation-timing-function: linear; }
    .noggles:nth-child(3) { left: 25%; animation-duration: 10s; animation-delay: 4s; animation-timing-function: ease; }
    .noggles:nth-child(4) { left: 35%; animation-duration: 11s; animation-delay: 1s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(5) { left: 45%; animation-duration: 13s; animation-delay: 3s; animation-timing-function: linear; }
    .noggles:nth-child(6) { left: 55%; animation-duration: 9s; animation-delay: 5s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(7) { left: 65%; animation-duration: 12s; animation-delay: 1s; animation-timing-function: ease; }
    .noggles:nth-child(8) { left: 75%; animation-duration: 10s; animation-delay: 6s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(9) { left: 85%; animation-duration: 12s; animation-delay: 2s; animation-timing-function: linear; }
    .noggles:nth-child(10) { left: 92%; animation-duration: 14s; animation-delay: 4s; animation-timing-function: ease; }
    .noggles:nth-child(11) { left: 10%; animation-duration: 11s; animation-delay: 7s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(12) { left: 20%; animation-duration: 9s; animation-delay: 3s; animation-timing-function: linear; }
    .noggles:nth-child(13) { left: 30%; animation-duration: 8s; animation-delay: 1s; animation-timing-function: ease; }
    .noggles:nth-child(14) { left: 40%; animation-duration: 12s; animation-delay: 5s; animation-timing-function: ease; }
    .noggles:nth-child(15) { left: 50%; animation-duration: 10s; animation-delay: 2s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(16) { left: 60%; animation-duration: 14s; animation-delay: 6s; animation-timing-function: linear; }
    .noggles:nth-child(17) { left: 70%; animation-duration: 11s; animation-delay: 4s; animation-timing-function: ease; }
    .noggles:nth-child(18) { left: 80%; animation-duration: 8s; animation-delay: 7s; animation-timing-function: ease-in-out; }
    .noggles:nth-child(19) { left: 88%; animation-duration: 10s; animation-delay: 3s; animation-timing-function: ease; }
    .noggles:nth-child(20) { left: 95%; animation-duration: 13s; animation-delay: 1s; animation-timing-function: linear; }
  </style>
</head>
<body>
  <div class="background">
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
  </div>
</body>
</html>`,
      "fidgetBackground": "#ffffff",
      "fidgetBorderColor": "#eeeeee",
      "fidgetBorderRadius": "12px",
      "fidgetBorderWidth": "1px",
      "fidgetShadow": "none",
      "font": "Inter",
      "fontColor": "#000000",
      "gridSpacing": "16",
      "headingsFont": "Inter",
      "headingsFontColor": "#000000",
      "musicURL": "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804"
    }
  },
  "fidgetInstanceDatums": {
    "feed:9f8f8e69-6323-4e7d-8f9a-210f522827f7": {
      "config": {
        "data": {},
        "editable": true,
        "settings": {
          "Xhandle": "thenounspace",
          "background": "var(--user-theme-fidget-background)",
          "channel": "nouns",
          "feedType": "filter",
          "fidgetBorderColor": "var(--user-theme-fidget-border-color)",
          "fidgetBorderWidth": "var(--user-theme-fidget-border-width)",
          "fidgetShadow": "var(--user-theme-fidget-shadow)",
          "filterType": "channel_id",
          "fontColor": "var(--user-theme-font-color)",
          "fontFamily": "var(--user-theme-font)",
          "keyword": "",
          "selectPlatform": {
            "icon": "/images/farcaster.jpeg",
            "name": "Farcaster"
          },
          "showOnMobile": true,
          "style": "light",
          "username": "",
          "users": ""
        }
      },
      "fidgetType": "feed",
      "id": "feed:9f8f8e69-6323-4e7d-8f9a-210f522827f7"
    },
    "links:c96c96c9-c19d-47c7-b24d-b11985671470": {
      "id": "links:c96c96c9-c19d-47c7-b24d-b11985671470",
      "fidgetType": "links",
      "config": {
        "data": {},
        "editable": true,
        "settings": {
          "showOnMobile": true,
          "title": "Socials",
          "links": [
            {
              "avatar": "https://assets1.chainstoreage.com/images/v/max_width_1440/2023-07/twitter-x-logo.png",
              "description": "",
              "text": "X",
              "url": "https://x.com/nounsdao?lang=en"
            },
            {
              "text": "Discord",
              "url": "https://discord.gg/TMDzKuf5",
              "avatar": "https://play-lh.googleusercontent.com/0oO5sAneb9lJP6l8c6DH4aj6f85qNpplQVHmPmbbBxAukDnlO7DarDW0b-kEIHa8SQ=w240-h480-rw",
              "description": ""
            },
            {
              "text": "Instagram",
              "url": "https://www.instagram.com/nounish/?hl=en",
              "avatar": "https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg",
              "description": ""
            }
          ],
          "viewMode": "list",
          "headingsFontFamily": "'Londrina Solid', 'Londrina Solid Fallback'",
          "fontFamily": "Theme Font",
          "HeaderColor": "var(--user-theme-headings-font-color)",
          "DescriptionColor": "var(--user-theme-font-color)",
          "itemBackground": "var(--user-theme-fidget-background)",
          "background": "var(--user-theme-fidget-background)",
          "fidgetBorderWidth": "var(--user-theme-fidget-border-width)",
          "fidgetBorderColor": "var(--user-theme-fidget-border-color)",
          "fidgetShadow": "var(--user-theme-fidget-shadow)",
          "css": ""
        }
      },
    },
    "feed:Ns29YIhpl9SWpf5O36d2": {
      "config": {
        "data": {},
        "editable": true,
        "settings": {
          "Xhandle": "nounsdao",
          "background": "var(--user-theme-fidget-background)",
          "channel": "",
          "feedType": "filter",
          "fidgetBorderColor": "var(--user-theme-fidget-border-color)",
          "fidgetBorderWidth": "var(--user-theme-fidget-border-width)",
          "fidgetShadow": "var(--user-theme-fidget-shadow)",
          "filterType": "channel_id",
          "fontColor": "var(--user-theme-font-color)",
          "fontFamily": "var(--user-theme-font)",
          "keyword": "",
          "selectPlatform": {
            "icon": "/images/twitter.avif",
            "name": "X"
          },
          "showOnMobile": true,
          "style": "light",
          "username": "",
          "users": ""
        }
      },
      "fidgetType": "feed",
      "id": "feed:Ns29YIhpl9SWpf5O36d2"
    },
  },
  "fidgetTrayContents": [],
  "isEditable": false,
  "timestamp": "2025-06-20T09:51:46.060Z"
};

export const GOVERNANCE_TAB_CONFIG: SpaceConfig = {
  "layoutID": "28dcce75-17c5-4c12-b5e2-8524ffc268cf",
  "layoutDetails": {
    "layoutConfig": {
      "layout": [
        {
          "w": 12,
          "h": 10,
          "x": 0,
          "y": 0,
          "i": "iframe:87e54ba3-9894-4ca6-9b75-3a67d9477af9",
          "minW": 2,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        }
      ]
    },
    "layoutFidget": "grid"
  },
  "theme": {
    "id": "Homebase-Tab 2 - 1-Theme",
    "name": "Homebase-Tab 2 - 1-Theme",
    "properties": {
      "background": "#ffffff",
      "backgroundHTML": "",
      "fidgetBackground": "#ffffff",
      "fidgetBorderColor": "#eeeeee",
      "fidgetBorderRadius": "0px",
      "fidgetBorderWidth": "0px",
      "fidgetShadow": "none",
      "font": "Inter",
      "fontColor": "#000000",
      "gridSpacing": "0",
      "headingsFont": "Inter",
      "headingsFontColor": "#000000",
      "musicURL": "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804"
    }
  },
  "fidgetInstanceDatums": {
    "iframe:87e54ba3-9894-4ca6-9b75-3a67d9477af9": {
      "id": "iframe:87e54ba3-9894-4ca6-9b75-3a67d9477af9",
      "fidgetType": "iframe",
      "config": {
        "data": {},
        "editable": true,
        "settings": {
          "url": "https://www.nouns.camp/?tab=proposals",
          "cropOffsetX": 0,
          "cropOffsetY": -3,
          "isScrollable": false,
          "showOnMobile": true,
          "background": "var(--user-theme-fidget-background)",
          "fidgetBorderWidth": "var(--user-theme-fidget-border-width)",
          "fidgetBorderColor": "var(--user-theme-fidget-border-color)",
          "fidgetShadow": "var(--user-theme-fidget-shadow)"
        }
      }
    }
  },
  "fidgetTrayContents": [],
  "isEditable": false,
  "timestamp": "2025-06-20T06:51:01.474Z"
};

export const RESOURCES_TAB_CONFIG: SpaceConfig = {
  "layoutID": "0bbe52be-5c9e-4d87-ad76-bd4b114c790a",
  "layoutDetails": {
    "layoutConfig": {
      "layout": [
        {
          "w": 12,
          "h": 10,
          "x": 0,
          "y": 0,
          "i": "iframe:d06b525b-54ff-4074-bfa3-a39807e42738",
          "minW": 2,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        }
      ]
    },
    "layoutFidget": "grid"
  },
  "theme": {
    "id": "Homebase-Tab 3-Theme",
    "name": "Homebase-Tab 3-Theme",
    "properties": {
      "font": "Inter",
      "fontColor": "#000000",
      "headingsFont": "Inter",
      "headingsFontColor": "#000000",
      "background": "#ffffff",
      "backgroundHTML": "",
      "musicURL": "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      "fidgetBackground": "#ffffff",
      "fidgetBorderWidth": "0px",
      "fidgetBorderColor": "#eeeeee",
      "fidgetShadow": "none",
      "fidgetBorderRadius": "12px",
      "gridSpacing": "0"
    }
  },
  "fidgetInstanceDatums": {
    "iframe:d06b525b-54ff-4074-bfa3-a39807e42738": {
      "id": "iframe:d06b525b-54ff-4074-bfa3-a39807e42738",
      "fidgetType": "iframe",
      "config": {
        "editable": true,
        "data": {},
        "settings": {
          "url": "https://nouns.center/assets",
          "size": 1.2,
          "cropOffsetX": 0,
          "cropOffsetY": -5,
          "isScrollable": false,
          "showOnMobile": true,
          "background": "var(--user-theme-fidget-background)",
          "fidgetBorderWidth": "0",
          "fidgetBorderColor": "rgba(238, 238, 238, 0)",
          "fidgetShadow": "none"
        }
      }
    }
  },
  "fidgetTrayContents": [],
  "isEditable": false,
  "timestamp": "2025-06-20T07:14:04.678Z"
};

export const FUNDED_WORKS_TAB_CONFIG: SpaceConfig = {
  "layoutID": "0bbe52be-5c9e-4d87-ad76-bd4b114c790a",
  "layoutDetails": {
    "layoutConfig": {
      "layout": [
        {
          "w": 12,
          "h": 10,
          "x": 0,
          "y": 0,
          "i": "iframe:d06b525b-54ff-4074-bfa3-a39807e42738",
          "minW": 2,
          "maxW": 36,
          "minH": 2,
          "maxH": 36,
          "moved": false,
          "static": false,
          "resizeHandles": [
            "s",
            "w",
            "e",
            "n",
            "sw",
            "nw",
            "se",
            "ne"
          ],
          "isBounded": false
        }
      ]
    },
    "layoutFidget": "grid"
  },
  "theme": {
    "id": "Homebase-Tab 3-Theme",
    "name": "Homebase-Tab 3-Theme",
    "properties": {
      "font": "Inter",
      "fontColor": "#000000",
      "headingsFont": "Inter",
      "headingsFontColor": "#000000",
      "background": "#ffffff",
      "backgroundHTML": "",
      "musicURL": "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      "fidgetBackground": "#ffffff",
      "fidgetBorderWidth": "0px",
      "fidgetBorderColor": "#eeeeee",
      "fidgetShadow": "none",
      "fidgetBorderRadius": "12px",
      "gridSpacing": "0"
    }
  },
  "fidgetInstanceDatums": {
    "iframe:d06b525b-54ff-4074-bfa3-a39807e42738": {
      "id": "iframe:d06b525b-54ff-4074-bfa3-a39807e42738",
      "fidgetType": "iframe",
      "config": {
        "editable": true,
        "data": {},
        "settings": {
          "url": "https://nouns.world/explore",
          "size": 1.2,
          "cropOffsetX": 0,
          "cropOffsetY": -2,
          "isScrollable": false,
          "showOnMobile": true,
          "background": "var(--user-theme-fidget-background)",
          "fidgetBorderWidth": "0",
          "fidgetBorderColor": "rgba(238, 238, 238, 0)",
          "fidgetShadow": "none"
        }
      }
    }
  },
  "fidgetTrayContents": [],
  "isEditable": false,
  "timestamp": "2025-06-20T07:14:04.678Z"
};


// Export all configurations
export const HOMEBASE_TABS_CONFIG = {
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  RESOURCES_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
};

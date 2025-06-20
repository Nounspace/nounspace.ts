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
          "y": 0,
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
      "backgroundHTML": "",
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
      }
    }
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

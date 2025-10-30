import { TabConfig } from '../../systemConfig';

const createInitialChannelSpaceConfig = (channelId: string): TabConfig => ({
  name: "channel",
  displayName: "Channel",
  layoutID: "clanker-channel-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 8, h: 4, x: 0, y: 0, i: "channel" },
            { w: 4, h: 4, x: 8, y: 0, i: "market-data" },
            { w: 6, h: 4, x: 0, y: 4, i: "feed" },
            { w: 6, h: 4, x: 6, y: 4, i: "gallery" },
            { w: 12, h: 3, x: 0, y: 8, i: "links" }
          ]
        },
        layoutFidget: "grid"
      },
  theme: {
    id: "clanker-channel-theme",
    name: "Clanker Channel Theme",
    properties: {
      font: "Inter, system-ui, sans-serif",
      fontColor: "#ffffff",
      headingsFont: "Inter, system-ui, sans-serif",
      headingsFontColor: "#00ff88",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      backgroundHTML: "",
      musicURL: "",
      fidgetBackground: "rgba(0, 255, 136, 0.1)",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "rgba(0, 255, 136, 0.3)",
      fidgetShadow: "0 4px 20px rgba(0, 255, 136, 0.2)",
      fidgetBorderRadius: "12px",
      gridSpacing: "16px"
    }
  },
  fidgetInstanceDatums: {
    "channel": {
      id: "channel",
      fidgetType: "channel",
      config: {
        data: { channelId },
        editable: true,
        settings: {
          showName: true,
          showDescription: true,
          showMembers: true
        }
      }
    },
    "market-data": {
      id: "market-data",
      fidgetType: "Market",
      config: {
        data: { channelId },
        editable: true,
        settings: {
          showChannelTokens: true,
          showVolume: true,
          showPriceChanges: true
        }
      }
    },
    "feed": {
      id: "feed",
      fidgetType: "feed",
      config: {
        data: { channelId },
        editable: true,
        settings: {
          showChannelCasts: true,
          showTokenDiscussions: true,
          maxCasts: 15
        }
      }
    },
    "gallery": {
      id: "gallery",
      fidgetType: "gallery",
      config: {
        data: { channelId },
        editable: true,
        settings: {
          showChannelImages: true,
          showTokenImages: true,
          maxImages: 12
        }
      }
    },
    "links": {
      id: "links",
      fidgetType: "links",
      config: {
        data: { channelId },
        editable: true,
        settings: {
          showChannelLinks: true,
          showTokenLinks: true
        }
      }
    }
  },
  fidgetTrayContents: [
    "channel",
    "Market",
    "feed",
    "gallery",
    "links",
    "text",
    "Video",
    "Chat"
  ],
  isEditable: true,
  timestamp: new Date().toISOString()
});

export default createInitialChannelSpaceConfig;

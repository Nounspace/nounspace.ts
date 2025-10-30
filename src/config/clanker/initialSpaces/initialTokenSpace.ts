import { TabConfig } from '../../systemConfig';

const createInitialTokenSpaceConfigForAddress = (tokenAddress: string): TabConfig => ({
  name: "token",
  displayName: "Token",
  layoutID: "clanker-token-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 6, h: 4, x: 0, y: 0, i: "market-data" },
            { w: 6, h: 4, x: 6, y: 0, i: "portfolio" },
            { w: 4, h: 3, x: 0, y: 4, i: "swap" },
            { w: 4, h: 3, x: 4, y: 4, i: "feed" },
            { w: 4, h: 3, x: 8, y: 4, i: "gallery" },
            { w: 8, h: 4, x: 0, y: 7, i: "links" },
            { w: 4, h: 4, x: 8, y: 7, i: "text" },
            { w: 12, h: 3, x: 0, y: 11, i: "iframe" }
          ]
        },
        layoutFidget: "grid"
      },
  theme: {
    id: "clanker-token-theme",
    name: "Clanker Token Theme",
    properties: {
      font: "Inter, system-ui, sans-serif",
      fontColor: "#ffffff",
      headingsFont: "Inter, system-ui, sans-serif",
      headingsFontColor: "#ffd700",
      background: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
      backgroundHTML: "",
      musicURL: "",
      fidgetBackground: "rgba(255, 215, 0, 0.1)",
      fidgetBorderWidth: "2px",
      fidgetBorderColor: "#ffd700",
      fidgetShadow: "0 4px 20px rgba(255, 215, 0, 0.2)",
      fidgetBorderRadius: "12px",
      gridSpacing: "16px"
    }
  },
  fidgetInstanceDatums: {
    "market-data": {
      id: "market-data",
      fidgetType: "Market",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenData: true,
          showPrice: true,
          showMarketCap: true
        }
      }
    },
    "portfolio": {
      id: "portfolio",
      fidgetType: "Portfolio",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenHoldings: true,
          showValue: true,
          showChange: true
        }
      }
    },
    "swap": {
      id: "swap",
      fidgetType: "Swap",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenSwap: true,
          showAmountInput: true
        }
      }
    },
    "feed": {
      id: "feed",
      fidgetType: "feed",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenDiscussions: true,
          maxCasts: 15
        }
      }
    },
    "gallery": {
      id: "gallery",
      fidgetType: "gallery",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenImages: true,
          maxImages: 12
        }
      }
    },
    "links": {
      id: "links",
      fidgetType: "links",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenLinks: true,
          showExternalTools: true
        }
      }
    },
    "text": {
      id: "text",
      fidgetType: "text",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenDescription: true,
          showContractInfo: true
        }
      }
    },
    "iframe": {
      id: "iframe",
      fidgetType: "iframe",
      config: {
        data: { tokenAddress },
        editable: true,
        settings: {
          showTokenAnalytics: true,
          url: `https://analytics.clanker.world/token/${tokenAddress}`
        }
      }
    }
  },
  fidgetTrayContents: [
    "Market",
    "Portfolio",
    "Swap",
    "feed",
    "gallery",
    "links",
    "text",
    "iframe",
    "Video",
    "Rss"
  ],
  isEditable: true,
  timestamp: new Date().toISOString()
});

export default createInitialTokenSpaceConfigForAddress;

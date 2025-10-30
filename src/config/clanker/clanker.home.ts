export const clankerHomePage = {
  defaultTab: "trading",
  tabOrder: ["trading", "trending", "portfolio", "create", "analytics"],
  tabs: {
    trading: {
      name: "trading",
      displayName: "Trading",
      layoutID: "clanker-trading-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 6, h: 4, x: 0, y: 0, i: "market-data" },
            { w: 6, h: 4, x: 6, y: 0, i: "portfolio" },
            { w: 4, h: 3, x: 0, y: 4, i: "swap" },
            { w: 4, h: 3, x: 4, y: 4, i: "token-feed" },
            { w: 4, h: 3, x: 8, y: 4, i: "token-gallery" },
            { w: 12, h: 3, x: 0, y: 7, i: "token-links" }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "clanker-trading-theme",
        name: "Clanker Trading Theme",
        properties: {
          font: "Inter, system-ui, sans-serif",
          fontColor: "#ffffff",
          headingsFont: "Inter, system-ui, sans-serif",
          headingsFontColor: "#00d4ff",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          backgroundHTML: "",
          musicURL: "",
          fidgetBackground: "rgba(0, 212, 255, 0.1)",
          fidgetBorderWidth: "1px",
          fidgetBorderColor: "rgba(0, 212, 255, 0.3)",
          fidgetShadow: "0 4px 20px rgba(0, 212, 255, 0.2)",
          fidgetBorderRadius: "12px",
          gridSpacing: "16px"
        }
      },
      fidgetInstanceDatums: {
        "market-data": {
          id: "market-data",
          fidgetType: "Market",
          config: {
            data: {},
            editable: true,
            settings: {
              showMarketCap: true,
              showVolume: true,
              showPriceChange: true
            }
          }
        },
        "portfolio": {
          id: "portfolio",
          fidgetType: "Portfolio",
          config: {
            data: {},
            editable: true,
            settings: {
              showHoldings: true,
              showValue: true,
              showPnl: true
            }
          }
        },
        "swap": {
          id: "swap",
          fidgetType: "Swap",
          config: {
            data: {},
            editable: true,
            settings: {
              showTokenSelection: true,
              showAmountInput: true
            }
          }
        },
        "token-feed": {
          id: "token-feed",
          fidgetType: "feed",
          config: {
            data: {},
            editable: true,
            settings: {
              showTokenDiscussions: true,
              maxCasts: 10
            }
          }
        },
        "token-gallery": {
          id: "token-gallery",
          fidgetType: "gallery",
          config: {
            data: {},
            editable: true,
            settings: {
              showTokenImages: true,
              maxImages: 20
            }
          }
        },
        "token-links": {
          id: "token-links",
          fidgetType: "links",
          config: {
            data: {},
            editable: true,
            settings: {
              showTokenLinks: true,
              showExternalTools: true
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
        "iframe"
      ],
      isEditable: true,
      timestamp: new Date().toISOString()
    },
    trending: {
      name: "trending",
      displayName: "Trending",
      layoutID: "clanker-trending-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 8, h: 6, x: 0, y: 0, i: "market-data" },
            { w: 4, h: 6, x: 8, y: 0, i: "portfolio" },
            { w: 6, h: 4, x: 0, y: 6, i: "token-feed" },
            { w: 6, h: 4, x: 6, y: 6, i: "token-gallery" }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "clanker-trending-theme",
        name: "Clanker Trending Theme",
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
            data: {},
            editable: true,
            settings: {
              showTrending: true,
              showVolume: true,
              showPriceChange: true
            }
          }
        },
        "portfolio": {
          id: "portfolio",
          fidgetType: "Portfolio",
          config: {
            data: {},
            editable: true,
            settings: {
              showTopHoldings: true,
              showPerformance: true
            }
          }
        },
        "token-feed": {
          id: "token-feed",
          fidgetType: "feed",
          config: {
            data: {},
            editable: true,
            settings: {
              showTrendingDiscussions: true,
              maxCasts: 15
            }
          }
        },
        "token-gallery": {
          id: "token-gallery",
          fidgetType: "gallery",
          config: {
            data: {},
            editable: true,
            settings: {
              showTrendingImages: true,
              maxImages: 12
            }
          }
        }
      },
      fidgetTrayContents: [
        "Market",
        "Portfolio",
        "feed",
        "gallery",
        "links",
        "Video",
        "Rss"
      ],
      isEditable: true,
      timestamp: new Date().toISOString()
    },
    portfolio: {
      name: "portfolio",
      displayName: "Portfolio",
      layoutID: "clanker-portfolio-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 6, h: 4, x: 0, y: 0, i: "portfolio" },
            { w: 6, h: 4, x: 6, y: 0, i: "market-data" },
            { w: 12, h: 4, x: 0, y: 4, i: "token-feed" },
            { w: 6, h: 3, x: 0, y: 8, i: "swap" },
            { w: 6, h: 3, x: 6, y: 8, i: "token-gallery" }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "clanker-portfolio-theme",
        name: "Clanker Portfolio Theme",
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
        "portfolio": {
          id: "portfolio",
          fidgetType: "Portfolio",
          config: {
            data: {},
            editable: true,
            settings: {
              showTotalValue: true,
              showPnl: true,
              showAllocation: true
            }
          }
        },
        "market-data": {
          id: "market-data",
          fidgetType: "Market",
          config: {
            data: {},
            editable: true,
            settings: {
              showPortfolioTokens: true,
              showPriceChanges: true
            }
          }
        },
        "token-feed": {
          id: "token-feed",
          fidgetType: "feed",
          config: {
            data: {},
            editable: true,
            settings: {
              showPortfolioDiscussions: true,
              maxCasts: 20
            }
          }
        },
        "swap": {
          id: "swap",
          fidgetType: "Swap",
          config: {
            data: {},
            editable: true,
            settings: {
              showQuickSwap: true,
              showPortfolioTokens: true
            }
          }
        },
        "token-gallery": {
          id: "token-gallery",
          fidgetType: "gallery",
          config: {
            data: {},
            editable: true,
            settings: {
              showPortfolioImages: true,
              maxImages: 15
            }
          }
        }
      },
      fidgetTrayContents: [
        "Portfolio",
        "Market",
        "feed",
        "Swap",
        "gallery",
        "links",
        "Video",
        "Chat"
      ],
      isEditable: true,
      timestamp: new Date().toISOString()
    },
    create: {
      name: "create",
      displayName: "Create",
      layoutID: "clanker-create-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 8, h: 6, x: 0, y: 0, i: "text" },
            { w: 4, h: 6, x: 8, y: 0, i: "links" },
            { w: 6, h: 4, x: 0, y: 6, i: "gallery" },
            { w: 6, h: 4, x: 6, y: 6, i: "feed" }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "clanker-create-theme",
        name: "Clanker Create Theme",
        properties: {
          font: "Inter, system-ui, sans-serif",
          fontColor: "#ffffff",
          headingsFont: "Inter, system-ui, sans-serif",
          headingsFontColor: "#ff6b6b",
          background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
          backgroundHTML: "",
          musicURL: "",
          fidgetBackground: "rgba(255, 107, 107, 0.1)",
          fidgetBorderWidth: "2px",
          fidgetBorderColor: "#ff6b6b",
          fidgetShadow: "0 6px 24px rgba(255, 107, 107, 0.3)",
          fidgetBorderRadius: "16px",
          gridSpacing: "20px"
        }
      },
      fidgetInstanceDatums: {
        "text": {
          id: "text",
          fidgetType: "text",
          config: {
            data: {},
            editable: true,
            settings: {
              content: "# Create a Clanker\n\nWelcome to the Clankverse! Here you can create and launch your own tokens.\n\n## Getting Started\n1. Choose a token name and symbol\n2. Set initial supply and parameters\n3. Deploy your token\n4. Start trading!\n\nJoin the community and start building!",
              showMarkdown: true
            }
          }
        },
        "links": {
          id: "links",
          fidgetType: "links",
          config: {
            data: {},
            editable: true,
            settings: {
              showCreationTools: true,
              showDocumentation: true,
              showCommunity: true
            }
          }
        },
        "gallery": {
          id: "gallery",
          fidgetType: "gallery",
          config: {
            data: {},
            editable: true,
            settings: {
              showRecentCreations: true,
              showFeaturedTokens: true,
              maxImages: 12
            }
          }
        },
        "feed": {
          id: "feed",
          fidgetType: "feed",
          config: {
            data: {},
            editable: true,
            settings: {
              showCreationDiscussions: true,
              showTips: true,
              maxCasts: 15
            }
          }
        }
      },
      fidgetTrayContents: [
        "text",
        "links",
        "gallery",
        "feed",
        "iframe",
        "Video",
        "Chat",
        "BuilderScore"
      ],
      isEditable: true,
      timestamp: new Date().toISOString()
    },
    analytics: {
      name: "analytics",
      displayName: "Analytics",
      layoutID: "clanker-analytics-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 6, h: 4, x: 0, y: 0, i: "market-data" },
            { w: 6, h: 4, x: 6, y: 0, i: "portfolio" },
            { w: 4, h: 4, x: 0, y: 4, i: "rss" },
            { w: 4, h: 4, x: 4, y: 4, i: "gallery" },
            { w: 4, h: 4, x: 8, y: 4, i: "feed" },
            { w: 12, h: 3, x: 0, y: 8, i: "iframe" }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "clanker-analytics-theme",
        name: "Clanker Analytics Theme",
        properties: {
          font: "Inter, system-ui, sans-serif",
          fontColor: "#ffffff",
          headingsFont: "Inter, system-ui, sans-serif",
          headingsFontColor: "#a8e6cf",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          backgroundHTML: "",
          musicURL: "",
          fidgetBackground: "rgba(168, 230, 207, 0.15)",
          fidgetBorderWidth: "1px",
          fidgetBorderColor: "rgba(168, 230, 207, 0.4)",
          fidgetShadow: "0 10px 40px rgba(168, 230, 207, 0.2)",
          fidgetBorderRadius: "20px",
          gridSpacing: "24px"
        }
      },
      fidgetInstanceDatums: {
        "market-data": {
          id: "market-data",
          fidgetType: "Market",
          config: {
            data: {},
            editable: true,
            settings: {
              showAnalytics: true,
              showMarketCap: true,
              showVolume: true
            }
          }
        },
        "portfolio": {
          id: "portfolio",
          fidgetType: "Portfolio",
          config: {
            data: {},
            editable: true,
            settings: {
              showAnalytics: true,
              showPerformance: true,
              showMetrics: true
            }
          }
        },
        "rss": {
          id: "rss",
          fidgetType: "Rss",
          config: {
            data: {},
            editable: true,
            settings: {
              showMarketNews: true,
              showTokenNews: true,
              maxItems: 10
            }
          }
        },
        "gallery": {
          id: "gallery",
          fidgetType: "gallery",
          config: {
            data: {},
            editable: true,
            settings: {
              showAnalyticsCharts: true,
              showDataVisualizations: true,
              maxImages: 8
            }
          }
        },
        "feed": {
          id: "feed",
          fidgetType: "feed",
          config: {
            data: {},
            editable: true,
            settings: {
              showAnalyticsDiscussions: true,
              showMarketInsights: true,
              maxCasts: 12
            }
          }
        },
        "iframe": {
          id: "iframe",
          fidgetType: "iframe",
          config: {
            data: {},
            editable: true,
            settings: {
              showExternalAnalytics: true,
              showTradingTools: true,
              url: "https://analytics.clanker.world"
            }
          }
        }
      },
      fidgetTrayContents: [
        "Market",
        "Portfolio",
        "Rss",
        "gallery",
        "feed",
        "iframe",
        "Video",
        "Chat"
      ],
      isEditable: true,
      timestamp: new Date().toISOString()
    }
  },
  layout: {
    defaultLayoutFidget: "grid",
    gridSpacing: 16,
    theme: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fidgetBackground: "rgba(255, 255, 255, 0.1)",
      font: "Inter, system-ui, sans-serif",
      fontColor: "#ffffff"
    }
  }
};

export const nounsSpaces = {
  base: {
    layoutID: "",
    layoutDetails: {
      layoutConfig: { layout: [] },
      layoutFidget: "grid",
    },
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
        musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
        fidgetBackground: "#ffffff",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#C0C0C0",
        fidgetShadow: "none",
        fidgetBorderRadius: "12px",
        gridSpacing: "16",
      },
    },
    fidgetInstanceDatums: {},
    fidgetTrayContents: [],
    tabNames: [],
  },
  profile: {
    defaultTabNames: ["Profile"],
    defaultFidgets: {
      feed: {
        config: {
          editable: false,
          settings: {
            feedType: "Filter",
            users: "{{fid}}",
            filterType: "Fids",
          },
          data: {},
        },
        fidgetType: "feed",
        id: "feed:profile",
      },
      portfolio: {
        config: {
          editable: false,
          settings: {
            trackType: "farcaster",
            farcasterUsername: "{{username}}",
            walletAddresses: "",
          },
          data: {},
        },
        fidgetType: "Portfolio",
        id: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
      },
    },
    layout: {
      feed: {
        w: 6, h: 8, x: 0, y: 0,
        i: "feed:profile",
        minW: 4, maxW: 36, minH: 6, maxH: 36,
        moved: false, static: false,
      },
      portfolio: {
        w: 6, h: 8, x: 7, y: 0,
        i: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
        minW: 3, maxW: 36, minH: 3, maxH: 36,
        moved: false, static: false,
      },
    },
  },
  channel: {
    defaultTabNames: ["Channel"],
    defaultFidgets: {
      feed: {
        config: {
          editable: false,
          settings: {
            feedType: "Filter",
            filterType: "ChannelId",
            channel: "{{channelId}}",
          },
          data: {},
        },
        fidgetType: "feed",
        id: "feed:channel",
      },
    },
    layout: {
      feed: {
        w: 6, h: 8, x: 0, y: 0,
        i: "feed:channel",
        minW: 4, maxW: 20, minH: 6, maxH: 12,
        moved: false, static: false,
      },
    },
  },
  token: {
    defaultTabNames: ["Token"],
    defaultFidgets: {
      swap: {
        config: {
          data: {},
          editable: true,
          settings: {
            defaultBuyToken: "{{address}}",
            defaultSellToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            fromChain: "{{network}}",
            toChain: "{{network}}",
            size: 0.8,
          },
        },
        fidgetType: "Swap",
        id: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
      },
      market: {
        config: {
          data: {},
          editable: true,
          settings: {
            tokenAddress: "{{address}}",
            network: "{{network}}",
          },
        },
        fidgetType: "market",
        id: "market:token-market",
      },
      cast: {
        config: {
          data: {},
          editable: true,
          settings: {
            background: "var(--user-theme-fidget-background)",
            castHash: "{{castHash}}",
            casterFid: "{{casterFid}}",
            fidgetBorderColor: "var(--user-theme-fidget-border-color)",
            fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
            fidgetShadow: "var(--user-theme-fidget-shadow)",
          },
        },
        fidgetType: "cast",
        id: "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71",
      },
    },
    layout: {
      swap: {
        w: 6, h: 8, x: 0, y: 0,
        i: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
        minW: 4, maxW: 36, minH: 6, maxH: 36,
        moved: false, static: false,
      },
      market: {
        w: 6, h: 8, x: 7, y: 0,
        i: "market:token-market",
        minW: 4, maxW: 36, minH: 6, maxH: 36,
        moved: false, static: false,
      },
      cast: {
        w: 12, h: 6, x: 0, y: 8,
        i: "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71",
        minW: 4, maxW: 36, minH: 4, maxH: 36,
        moved: false, static: false,
      },
    },
  },
  proposal: {
    defaultTabNames: ["Proposal"],
    defaultFidgets: {
      proposal: {
        config: {
          editable: true,
          data: {},
          settings: {
            url: "https://www.nouns.camp/proposals/{{proposalId}}?tab=description",
            showOnMobile: true,
            customMobileDisplayName: "Proposal",
            background: "var(--user-theme-fidget-background)",
            fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
            fidgetBorderColor: "var(--user-theme-fidget-border-color)",
            fidgetShadow: "var(--user-theme-fidget-shadow)",
          },
        },
        fidgetType: "iframe",
        id: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
      },
      tldr: {
        config: {
          editable: true,
          data: {},
          settings: {
            url: "https://euphonious-kulfi-5e5a30.netlify.app/?id={{proposalId}}",
            showOnMobile: true,
            customMobileDisplayName: "TLDR",
            background: "var(--user-theme-fidget-background)",
            fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
            fidgetBorderColor: "var(--user-theme-fidget-border-color)",
            fidgetShadow: "var(--user-theme-fidget-shadow)",
          },
        },
        fidgetType: "iframe",
        id: "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d",
      },
      voting: {
        config: {
          editable: true,
          data: {},
          settings: {
            url: "https://nouns.wtf/vote/{{proposalId}}",
            showOnMobile: true,
            customMobileDisplayName: "Voting",
            background: "var(--user-theme-fidget-background)",
            fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
            fidgetBorderColor: "var(--user-theme-fidget-border-color)",
            fidgetShadow: "var(--user-theme-fidget-shadow)",
          },
        },
        fidgetType: "iframe",
        id: "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a",
      },
    },
    layout: {
      proposal: {
        w: 12, h: 6, x: 0, y: 0,
        i: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
        minW: 4, maxW: 36, minH: 4, maxH: 36,
        moved: false, static: false,
      },
      tldr: {
        w: 6, h: 6, x: 0, y: 6,
        i: "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d",
        minW: 4, maxW: 36, minH: 4, maxH: 36,
        moved: false, static: false,
      },
      voting: {
        w: 6, h: 6, x: 7, y: 6,
        i: "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a",
        minW: 4, maxW: 36, minH: 4, maxH: 36,
        moved: false, static: false,
      },
    },
  },
  homebase: {
    defaultTabNames: ["Homebase"],
    defaultFidgets: {
      onboarding: {
        config: {
          editable: true,
          settings: {
            title: "",
            text: "{{tutorialText}}",
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
        id: "text:onboarding",
      },
    },
    layout: {
      onboarding: {
        w: 6, h: 7, x: 0, y: 0,
        i: "text:onboarding",
        moved: false, static: false,
      },
    },
    onboarding: {
      tutorialText: `### 🖌️ Click the paintbrush in the bottom-left corner to open Customization Mode

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

### Customize Theme
- **Templates:** Select a pre-made Theme. Then, customize it further to make it your own.
- **Style:** Set a background color for the Tab, or set the default styles for all Fidgets on the Tab.
- **Fonts:** Set the default header and body fonts for Fidgets on the Tab.
- **Code:** Add HTML/CSS to fully customize the Tab's background, or generate a custom background with a prompt.

### Customize Music
Add a soundtrack to each Tab. Search for or paste the link to any song or playlist on YouTube, or select a music NFT.

### Homebase vs. Space
**Your Space** is your public profile that everyone can see.
**Your Homebase** is a private dashboard that only you can see.

You can use the same tricks and Fidgets to customize them both. Use your **Homebase** to access the content, communities, and functionality you love, and use your **Space** to share the content and functionality you love with your friends.

### Questions or feedback?
Tag [@nounspacetom](https://nounspace.com/s/nounspacetom) in a cast or join our [Discord](https://discord.gg/H8EYnEmj6q).

### Happy customizing!`,
      styling: {
        fontFamily: "Londrina Solid",
        fontColor: "#073b4c",
        headingsFontFamily: "Londrina Solid",
        headingsFontColor: "#2563ea",
        backgroundColor: "#06d6a0",
        borderColor: "#ffd166",
      },
    },
  },
};

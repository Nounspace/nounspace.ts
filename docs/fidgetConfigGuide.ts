// Example Fidget configuration data used for prompt context.
// This mirrors the shape of `fidgetInstanceDatums` in a SpaceConfig.

export interface ExampleFidgetConfig {
  editable: boolean;
  settings: Record<string, unknown>;
  data: Record<string, unknown>;
}

export interface ExampleFidgetInstance {
  config: ExampleFidgetConfig;
  fidgetType: string;
  id: string;
}

/**
 * FIDGET_CONFIG_GUIDE provides sample settings for each Fidget.
 * Comments describe what the Fidget does and give example inputs.
 */
export const FIDGET_CONFIG_GUIDE: Record<string, ExampleFidgetInstance> = {
  // Feed Fidget - displays casts from Farcaster or posts from X
  "feed:example": {
    config: {
      editable: true,
      settings: {
        // showOnMobile: whether to display on small screens
        // Example: true
        showOnMobile: true,
        // customMobileDisplayName: text shown in mobile nav
        // Example: "Feed"
        customMobileDisplayName: "Feed",
        // selectPlatform: choose Farcaster or X
        // Example: { name: "Farcaster" }
        selectPlatform: { name: "Farcaster" },
        // feedType: Following, For you, Trending, or Filter
        // Example: "following"
        feedType: "following",
        // filterType: Users, Channel, or Keyword when feedType is "filter"
        // Example: "Users"
        filterType: "Users",
        // username: Farcaster username for filterType "Users"
        // Example: "dwr"
        username: "dwr",
        // users: FID list for filterType "Users"
        // Example: "2"
        users: "2",
        // channel: Channel name for filterType "Channel"
        // Example: "nouns"
        channel: "nouns",
        // keyword: search term for filterType "Keyword"
        // Example: "nouns"
        keyword: "nouns",
        // Xhandle: username when selectPlatform is "X"
        // Example: "thenounspace"
        Xhandle: "thenounspace",
        // style: X timeline style "light" or "dark"
        // Example: "light"
        style: "light",
        // fontFamily: font for cast text
        // Example: "var(--user-theme-font)"
        fontFamily: "var(--user-theme-font)",
        // fontColor: color for cast text
        // Example: "#000000"
        fontColor: "#000000",
        // background: background color of the fidget
        // Example: "#FFFFFF"
        background: "#FFFFFF",
        // fidgetBorderWidth: border width
        // Example: "1px"
        fidgetBorderWidth: "1px",
        // fidgetBorderColor: border color
        // Example: "#CCCCCC"
        fidgetBorderColor: "#CCCCCC",
        // fidgetShadow: CSS box-shadow value
        // Example: "none"
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "feed",
    id: "feed:example",
  },

  // Cast Fidget - pins a single Farcaster cast
  "cast:example": {
    config: {
      editable: true,
      settings: {
        // showOnMobile: display on mobile
        // Example: true
        showOnMobile: true,
        // customMobileDisplayName: label in mobile nav
        // Example: "Cast"
        customMobileDisplayName: "Cast",
        // castUrl: Warpcast share URL
        // Example: "https://warpcast.com/~/post/0x123"
        castUrl: "https://warpcast.com/~/post/0x123",
        // castHash: hash of the cast
        // Example: "0x123"
        castHash: "0x123",
        // casterFid: FID of the author
        // Example: 1234
        casterFid: 1234,
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "cast",
    id: "cast:example",
  },

  // Gallery Fidget - displays an image or NFT
  "gallery:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Gallery",
        // imageUrl: direct link to an image
        // Example: "https://example.com/image.png"
        imageUrl: "https://example.com/image.png",
        // uploadedImage: URL returned from uploader
        // Example: "https://imgbb.com/abc123.png"
        uploadedImage: "https://imgbb.com/abc123.png",
        // RedirectionURL: open this link when clicked
        // Example: "https://nounspace.com"
        RedirectionURL: "https://nounspace.com",
        // Scale: resize multiplier 0.5 - 2
        // Example: 1
        Scale: 1,
        // selectMediaSource: URL, UPLOAD, WALLET, or EXTERNAL
        // Example: { name: "URL" }
        selectMediaSource: { name: "URL" },
        // nftAddress: contract address when using EXTERNAL source
        // Example: "0x123..."
        nftAddress: "0x123...",
        // nftTokenId: token id for the NFT
        // Example: "1"
        nftTokenId: "1",
        // network: chain identifier for the NFT
        // Example: "base"
        network: "base",
        // nftSelector: object from wallet picker
        // Example: { imageUrl: "https://example.com/nft.png" }
        nftSelector: { imageUrl: "https://example.com/nft.png" },
        // badgeColor: color of verified badge
        // Example: "rgb(55,114,249)"
        badgeColor: "rgb(55,114,249)",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "gallery",
    id: "gallery:example",
  },

  // Text Fidget - renders Markdown text
  "text:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Text",
        // title displayed above the content
        // Example: "Welcome"
        title: "Welcome",
        // text body in Markdown
        // Example: "Hello **world**"
        text: "Hello **world**",
        // color for links in the text
        // Example: "#0000FF"
        urlColor: "#0000FF",
        // fontFamily used for body text
        // Example: "var(--user-theme-font)"
        fontFamily: "var(--user-theme-font)",
        // fontColor used for body text
        // Example: "#000000"
        fontColor: "#000000",
        // headingsFontFamily used for the title
        // Example: "var(--user-theme-headings-font)"
        headingsFontFamily: "var(--user-theme-headings-font)",
        // headingsFontColor used for the title
        // Example: "#000000"
        headingsFontColor: "#000000",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // css: optional custom CSS
        // Example: ".class { color: red; }"
        css: ".class { color: red; }",
      },
      data: {},
    },
    fidgetType: "text",
    id: "text:example",
  },

  // Links Fidget - list of external links
  "links:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Links",
        // title for the list of links
        // Example: "Resources"
        title: "Resources",
        // array of links with text and url
        // Example: [{ text: "Nounspace", url: "https://nounspace.com" }]
        links: [{ text: "Nounspace", url: "https://nounspace.com" }],
        // display mode: "list" or "grid"
        // Example: "list"
        viewMode: "list",
        // headingsFontFamily for titles and link text
        headingsFontFamily: "var(--user-theme-headings-font)",
        // fontFamily for descriptions
        fontFamily: "var(--user-theme-font)",
        // HeaderColor: color for titles and link text
        HeaderColor: "#000000",
        // DescriptionColor: color for descriptions
        DescriptionColor: "#333333",
        // itemBackground: background of each link
        itemBackground: "#F5F5F5",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // css: optional custom CSS
        css: "",
      },
      data: {},
    },
    fidgetType: "links",
    id: "links:example",
  },

  // IFrame Fidget - embeds a webpage
  "iframe:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Site",
        // url of the site to embed
        // Example: "https://example.com"
        url: "https://example.com",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // size: scale factor 0.5 - 2
        // Example: 1
        size: 1,
      },
      data: {},
    },
    fidgetType: "iframe",
    id: "iframe:example",
  },

  // Swap Fidget - token swap widget
  "Swap:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Swap",
        // defaultSellToken: token address offered
        // Example: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        defaultSellToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        // defaultBuyToken: token address requested
        // Example: "0x48c6740bcf807d6c47c864faeea15ed4da3910ab"
        defaultBuyToken: "0x48c6740bcf807d6c47c864faeea15ed4da3910ab",
        // fromChain: chain id and name of the sell token
        // Example: { id: "8453", name: "Base" }
        fromChain: { id: "8453", name: "Base" },
        // toChain: chain id and name of the buy token
        // Example: { id: "8453", name: "Base" }
        toChain: { id: "8453", name: "Base" },
        background: "#FFFFFF",
        fidgetShadow: "none",
        // size: iframe scale multiplier
        // Example: 1
        size: 1,
      },
      data: {},
    },
    fidgetType: "Swap",
    id: "Swap:example",
  },

  // Chat Fidget - realtime chat room
  "Chat:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Chat",
        // roomName: chat room identifier or contract
        // Example: "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab"
        roomName: "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "Chat",
    id: "Chat:example",
  },

  // SnapShot Fidget - shows Snapshot proposals
  "SnapShot:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Gov",
        // snapshotEns: ENS name of the space
        // Example: "gnars.eth"
        snapshotEns: "gnars.eth",
        // headingsFontFamily used for proposal titles
        headingsFontFamily: "Theme Headings Font",
        // fontFamily used for proposal text
        fontFamily: "Theme Font",
        // fontColor used for proposal text
        fontColor: "#000000",
        // headingsFontColor used for titles
        headingsFontColor: "#000000",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "SnapShot",
    id: "SnapShot:example",
  },

  // Video Fidget - embeds a video player
  "Video:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Video",
        // url: YouTube or Vimeo link
        // Example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // size: scale multiplier
        // Example: 1
        size: 1,
      },
      data: {},
    },
    fidgetType: "Video",
    id: "Video:example",
  },

  // RSS Fidget - displays items from an RSS feed
  "Rss:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "RSS",
        // rssUrl: address of the RSS feed
        // Example: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
        rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        // title shown above the feed
        // Example: "News"
        title: "News",
        // fontFamily for body text
        fontFamily: "var(--user-theme-font)",
        // fontColor for body text
        fontColor: "#000000",
        // headingsFontFamily for titles
        headingsFontFamily: "var(--user-theme-headings-font)",
        // headingsFontColor for titles
        headingsFontColor: "#000000",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        itemBorderColor: "#CCCCCC",
        itemBackground: "#F5F5F5",
        fidgetShadow: "none",
        // css: custom CSS for entries
        css: "",
      },
      data: {},
    },
    fidgetType: "Rss",
    id: "Rss:example",
  },

  // Portfolio Fidget - displays balances for a Farcaster user or wallet
  "Portfolio:example": {
    config: {
      editable: true,
      settings: {
        // trackType: "farcaster" or "address"
        // Example: "farcaster"
        trackType: "farcaster",
        // farcasterUsername: username when tracking a Farcaster profile
        // Example: "dwr"
        farcasterUsername: "dwr",
        // walletAddresses: comma separated addresses when using "address" trackType
        // Example: "0x123..."
        walletAddresses: "0x123...",
        // fidgetBorderColor: color of the border
        // Example: "#CCCCCC"
        fidgetBorderColor: "#CCCCCC",
        // fidgetBorderWidth: width of the border
        // Example: "1px"
        fidgetBorderWidth: "1px",
        // fidgetShadow: CSS box-shadow value
        // Example: "none"
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "Portfolio",
    id: "Portfolio:example",
  },

  // Market Data Fidget - token chart widget
  "Market:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Chart",
        // chain: blockchain id and name
        // Example: { id: "8453", name: "base" }
        chain: { id: "8453", name: "base" },
        // token: token contract address
        // Example: "0x0DF1B77aAFEc59E926315e5234db3Fdea419d4E4"
        token: "0x0DF1B77aAFEc59E926315e5234db3Fdea419d4E4",
        // theme: "light" or "dark"
        // Example: "light"
        theme: "light",
        // dataSource: geckoterminal or dexscreener
        // Example: "geckoterminal"
        dataSource: "geckoterminal",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // size: iframe scale multiplier
        // Example: 1
        size: 1,
      },
      data: {},
    },
    fidgetType: "Market",
    id: "Market:example",
  },

  // Frame Fidget - embeds a Farcaster Frame
  "frame:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Frame",
        // url: link to the frame
        // Example: "https://example.com/frame"
        url: "https://example.com/frame",
        // Scale: scale factor for the embed
        // Example: 1
        Scale: 1,
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "frame",
    id: "frame:example",
  },

  // FramesV2 Fidget - renders a Farcaster mini app
  "FramesV2:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Mini App",
        // url: mini app Frame URL
        // Example: "https://example.com/frames"
        url: "https://example.com/frames",
        // collapsed: show a collapsed preview
        // Example: false
        collapsed: false,
        // title: optional heading text
        // Example: "My App"
        title: "My App",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
        // headingFont: font used for the title
        // Example: "var(--user-theme-headings-font)"
        headingFont: "var(--user-theme-headings-font)",
      },
      data: {},
    },
    fidgetType: "FramesV2",
    id: "FramesV2:example",
  },

  // Nounish Governance Fidget - proposals from Nounish DAOs
  "governance:example": {
    config: {
      editable: true,
      settings: {
        showOnMobile: true,
        customMobileDisplayName: "Gov",
        // selectedDao: DAO information object
        // Example: { name: "Nouns DAO", contract: "", graphUrl: "https://www.nouns.camp/subgraphs/nouns", icon: "https://example.com/nouns.png" }
        selectedDao: {
          name: "Nouns DAO",
          contract: "",
          graphUrl: "https://www.nouns.camp/subgraphs/nouns",
          icon: "https://example.com/nouns.png",
        },
        // fontFamily: body font
        // Example: "var(--user-theme-font)"
        fontFamily: "var(--user-theme-font)",
        // fontColor: text color
        // Example: "#000000"
        fontColor: "#000000",
        background: "#FFFFFF",
        fidgetBorderWidth: "1px",
        fidgetBorderColor: "#CCCCCC",
        fidgetShadow: "none",
      },
      data: {},
    },
    fidgetType: "governance",
    id: "governance:example",
  },
};

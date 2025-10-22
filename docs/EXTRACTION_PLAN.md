# Whitelabel Variable Extraction Plan

This document outlines a practical, step-by-step approach to extract all Nouns-specific variables from the current system and make them configurable through a systemConfig.

## Phase 1: Audit and Catalog Current References

### 1.1 Brand References Audit

**Files to examine:**
- `src/constants/metadata.ts` - App metadata
- `src/app/layout.tsx` - Root layout metadata
- `src/app/manifest.ts` - PWA manifest
- `src/constants/app.ts` - App configuration

**Current hardcoded values:**
```typescript
// src/constants/metadata.ts
APP_NAME: 'Nouns'
APP_SUBTITLE: 'A space for Nouns'
APP_DESCRIPTION: 'The social hub for Nouns'
APP_TAGLINE: 'A space for Nouns'

// src/app/layout.tsx
title: "Nounspace"
description: "The customizable web3 social app, built on Farcaster"
```

**Extraction tasks:**
- [ ] Create `src/config/brand.ts` - Extract all brand references
- [ ] Create `src/config/metadata.ts` - Extract metadata configuration
- [ ] Update `src/constants/metadata.ts` to use config
- [ ] Update `src/app/layout.tsx` to use config

### 1.2 Asset References Audit

**Files to examine:**
- `public/images/` - All image assets
- `src/constants/metadata.ts` - Asset URLs
- `src/app/layout.tsx` - Icon references
- `src/app/manifest.ts` - PWA icons

**Current hardcoded assets:**
```typescript
// Image references found:
- nounspace_logo.png
- nounspace_og_low.png
- nouns_yellow_logo.jpg
- noggles.svg
- favicon.ico
- icon-192x192.png
- icon-512x512.png
- apple-touch-icon.png
```

**Extraction tasks:**
- [ ] Create `src/config/assets.ts` - Extract all asset references
- [ ] Create `public/brands/nouns/` - Move Nouns assets
- [ ] Update all asset references to use config
- [ ] Create asset loading utilities

### 1.3 Theme References Audit

**Files to examine:**
- `src/constants/themes.ts` - Theme definitions
- `src/constants/nounishLowfi.ts` - Nounish theme
- `src/constants/initialHomebase.ts` - Default themes
- `src/common/lib/theme/` - Theme system

**Current hardcoded themes:**
```typescript
// src/constants/themes.ts
{
  id: "nounish",
  name: "Nounish",
  properties: {
    font: "Londrina Solid",
    fontColor: "#333333",
    headingsFont: "Work Sans",
    headingsFontColor: "#000000",
    background: "#ffffff",
    backgroundHTML: nounish,
    fidgetBackground: "#FFFAFA",
    fidgetBorderColor: "#F05252",
    fidgetBorderWidth: "2px",
    fidgetBorderRadius: "12px",
    fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
  }
}
```

**Extraction tasks:**
- [ ] Create `src/config/themes.ts` - Extract theme configurations
- [ ] Create `src/config/colors.ts` - Extract color palettes
- [ ] Create `src/config/fonts.ts` - Extract font configurations
- [ ] Update theme system to use config

### 1.4 Content References Audit

**Files to examine:**
- `src/fidgets/nouns-home/components/Sections.tsx` - Nouns content
- `src/constants/initialHomebase.ts` - Tutorial content
- `src/constants/initialProposalSpace.ts` - Proposal content
- `src/constants/initialProfileSpace.ts` - Profile content

**Current hardcoded content:**
```typescript
// FAQ content
const FAQ_ITEMS = [
  {
    question: "What is a Noun?",
    answer: "A Noun is a one-of-a-kind 32x32 pixel art character..."
  }
];

// Tutorial content
const tutorialText = `
### 🖌️ Click the paintbrush in the bottom-left corner to open Customization Mode
### Add Fidgets
1. Click the blue **+** button.
2. Drag a Fidget to an open spot on the grid.
3. Click Save
`;
```

**Extraction tasks:**
- [ ] Create `src/content/nouns/faq.ts` - Extract FAQ content
- [ ] Create `src/content/nouns/tutorial.ts` - Extract tutorial content
- [ ] Create `src/content/nouns/learning.ts` - Extract learning resources
- [ ] Create `src/content/nouns/sections.ts` - Extract section content

### 1.5 Community Integration Audit

**Files to examine:**
- `src/constants/basedDaos.ts` - DAO configurations
- `src/fidgets/nouns-home/` - Nouns-specific fidgets
- `src/fidgets/community/nouns-dao/` - Governance fidgets
- `src/fidgets/index.ts` - Fidget registry

**Current hardcoded integrations:**
```typescript
// DAO configurations
export const NOUNS_DAO = "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn";

// Fidget registry
export const CompleteFidgets = {
  governance: NounishGovernance,
  nounsHome: NounsHome,
  // ... other fidgets
};
```

**Extraction tasks:**
- [ ] Create `src/config/community.ts` - Extract community integrations
- [ ] Create `src/config/fidgets.ts` - Extract fidget configurations
- [ ] Create `src/config/daos.ts` - Extract DAO configurations
- [ ] Update fidget registry to use config

### 1.6 Home Page Configuration Audit

**Files to examine:**
- `src/app/home/[tabname]/homePageTabsConfig.tsx` - Home page tab configurations
- `src/app/home/[tabname]/page.tsx` - Home page logic
- `src/app/home/[tabname]/` - Home page structure

### 1.7 Initial Space Configuration Audit

**Files to examine:**
- `src/constants/initialSpaceConfig.ts` - Base empty space configuration
- `src/constants/initialProfileSpace.ts` - Profile space initial state
- `src/constants/initialChannelSpace.ts` - Channel space initial state
- `src/constants/initialTokenSpace.ts` - Token space initial state
- `src/constants/initialProposalSpace.ts` - Proposal space initial state
- `src/constants/initialHomebase.ts` - Homebase initial state

**Current hardcoded home configuration:**
```typescript
// Tab ordering for homepage
const tabOrdering = ["Nouns", "Social", "Governance", "Resources", "Funded Works", "Places"];

// Tab configurations
export const NOUNS_TAB_CONFIG = {
  layoutID: "88b78f73-37fb-4921-9410-bc298311c0bb",
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          w: 12, h: 10, x: 0, y: 0,
          i: "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01",
          // ... grid configuration
        }
      ]
    },
    layoutFidget: "grid"
  },
  theme: {
    id: "Homebase-Tab 4 - 1-Theme",
    name: "Homebase-Tab 4 - 1-Theme",
    properties: {
      background: "#ffffff",
      fidgetBackground: "#ffffff",
      font: "Inter",
      fontColor: "#000000",
      // ... theme properties
    }
  },
  fidgetInstanceDatums: {
    "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01": {
      config: {
        settings: {
          headingsFontFamily: "Londrina Solid",
          fontFamily: "Poppins",
          // ... fidget settings
        }
      },
      fidgetType: "nounsHome",
      id: "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01"
    }
  }
};

// Other tab configurations
export const SOCIAL_TAB_CONFIG: SpaceConfig = { /* ... */ };
export const GOVERNANCE_TAB_CONFIG: SpaceConfig = { /* ... */ };
export const RESOURCES_TAB_CONFIG: SpaceConfig = { /* ... */ };
export const FUNDED_WORKS_TAB_CONFIG: SpaceConfig = { /* ... */ };
export const PLACES_TAB_CONFIG: SpaceConfig = { /* ... */ };
```

**Extraction tasks:**
- [ ] Create `src/config/home.ts` - Extract home page configuration
- [ ] Create `src/config/tabs.ts` - Extract tab configurations
- [ ] Create `src/config/layouts.ts` - Extract layout configurations
- [ ] Update home page to use configuration

**Current hardcoded initial space configurations:**
```typescript
// Base empty space configuration
export const INITIAL_SPACE_CONFIG_EMPTY: Omit<SpaceConfig, "isEditable"> = {
  layoutID: "",
  layoutDetails: {
    layoutConfig: { layout: [] },
    layoutFidget: "grid",
  },
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {},
  fidgetTrayContents: [],
  tabNames: [],
};

// Profile space configuration
const createInitialProfileSpaceConfigForFid = (fid: number, username?: string) => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Profile"];
  config.fidgetInstanceDatums = {
    "feed:profile": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          users: fid,
          filterType: FilterType.Fids,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:profile",
    },
    "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e": {
      config: {
        editable: false,
        settings: {
          trackType: "farcaster",
          farcasterUsername: username ?? "",
          walletAddresses: "",
        },
        data: {},
      },
      fidgetType: "Portfolio",
      id: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
    },
  };
  // Layout configuration with feed and portfolio fidgets
  return config;
};

// Channel space configuration
const createInitialChannelSpaceConfig = (channelId: string) => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Channel"];
  config.fidgetInstanceDatums = {
    "feed:channel": {
      config: {
        editable: false,
        settings: {
          feedType: FeedType.Filter,
          filterType: FilterType.ChannelId,
          channel: channelId,
        },
        data: {},
      },
      fidgetType: "feed",
      id: "feed:channel",
    },
  };
  return config;
};

// Token space configuration
const createInitialTokenSpaceConfigForAddress = (
  address: string,
  castHash: string | null,
  casterFid: string | null,
  symbol: string,
  isClankerToken: boolean,
  network: EtherScanChainName = "base"
) => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1": {
      config: {
        data: {},
        editable: true,
        settings: {
          defaultBuyToken: address,
          defaultSellToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          fromChain: getNetworkWithId(network),
          toChain: getNetworkWithId(network),
          size: 0.8,
        },
      },
      fidgetType: "Swap",
      id: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
    },
    // ... other fidgets for token spaces
  };
  return config;
};

// Proposal space configuration
const createInitalProposalSpaceConfigForProposalId = (
  proposalId: string,
  proposerAddress: Address
) => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.fidgetInstanceDatums = {
    "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://www.nouns.camp/proposals/${proposalId}?tab=description`,
          showOnMobile: true,
          customMobileDisplayName: "Proposal",
          // ... styling settings
        },
      },
      fidgetType: "iframe",
      id: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
    },
    // ... other iframe fidgets for proposal spaces
  };
  return config;
};

// Homebase configuration
const INITIAL_HOMEBASE_CONFIG: SpaceConfig = {
  layoutID: "",
  layoutDetails: {
    layoutConfig: {
      layout: [
        {
          w: 6, h: 7, x: 0, y: 0,
          i: "text:onboarding",
          moved: false, static: false,
        },
      ],
    },
    layoutFidget: "grid",
  },
  theme: DEFAULT_THEME,
  fidgetInstanceDatums: {
    "text:onboarding": {
      config: {
        editable: true,
        settings: {
          title: "",
          text: tutorialText, // Long tutorial text
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
  isEditable: true,
  fidgetTrayContents: [],
};
```

**Extraction tasks:**
- [ ] Create `src/config/spaces.ts` - Extract initial space configurations
- [ ] Create `src/config/spaceTypes.ts` - Extract space type configurations
- [ ] Create `src/config/onboarding.ts` - Extract onboarding content
- [ ] Update space creation to use configuration

## Phase 2: Create Configuration Infrastructure

### 2.1 Create SystemConfig Interface

**File: `src/config/systemConfig.ts`**
```typescript
export interface SystemConfig {
  brand: BrandConfig;
  assets: AssetConfig;
  theme: ThemeConfig;
  content: ContentConfig;
  community: CommunityConfig;
  fidgets: FidgetConfig;
  navigation: NavigationConfig;
  homePage: HomePageConfig;
  spaces: SpaceConfig;
}

export interface BrandConfig {
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  website: string;
  social: {
    farcaster: string;
    discord?: string;
    twitter?: string;
  };
}

export interface AssetConfig {
  logo: string;
  logoDark?: string;
  favicon: string;
  appleTouchIcon: string;
  ogImage: string;
  splashImage: string;
  heroImage: string;
  communityIcon: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  customTheme?: ThemeProperties;
}

export interface ContentConfig {
  faq: FAQItem[];
  learning: LearningResource[];
  tutorial: TutorialContent;
  sections: {
    hero: HeroSection;
    about: AboutSection;
    features: FeatureSection[];
  };
}

export interface CommunityConfig {
  type: 'nouns' | 'custom';
  governance?: GovernanceConfig;
  token?: TokenConfig;
  auction?: AuctionConfig;
}

export interface FidgetConfig {
  enabled: string[];
  disabled: string[];
  custom: CustomFidget[];
  defaultLayout: FidgetLayout;
}

export interface NavigationConfig {
  homeTabs: TabConfig[];
  exploreCategories: Category[];
  footerLinks: FooterLink[];
}

export interface HomePageConfig {
  defaultTab: string;
  tabOrder: string[];
  tabs: {
    [key: string]: TabConfig;
  };
  layout: {
    defaultLayoutFidget: string;
    gridSpacing: number;
    theme: ThemeProperties;
  };
}

export interface TabConfig {
  name: string;
  displayName: string;
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeProperties;
  fidgetInstanceDatums: Record<string, FidgetInstanceData>;
  fidgetTrayContents: any[];
  isEditable: boolean;
  timestamp: string;
}

export interface SpaceConfig {
  base: BaseSpaceConfig;
  profile: ProfileSpaceConfig;
  channel: ChannelSpaceConfig;
  token: TokenSpaceConfig;
  proposal: ProposalSpaceConfig;
  homebase: HomebaseSpaceConfig;
}

export interface BaseSpaceConfig {
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeProperties;
  fidgetInstanceDatums: Record<string, FidgetInstanceData>;
  fidgetTrayContents: any[];
  tabNames: string[];
}

export interface ProfileSpaceConfig {
  defaultTabNames: string[];
  defaultFidgets: {
    feed: FidgetInstanceData;
    portfolio: FidgetInstanceData;
  };
  layout: {
    feed: GridItem;
    portfolio: GridItem;
  };
}

export interface ChannelSpaceConfig {
  defaultTabNames: string[];
  defaultFidgets: {
    feed: FidgetInstanceData;
  };
  layout: {
    feed: GridItem;
  };
}

export interface TokenSpaceConfig {
  defaultTabNames: string[];
  defaultFidgets: {
    swap: FidgetInstanceData;
    market: FidgetInstanceData;
    cast?: FidgetInstanceData;
  };
  layout: {
    swap: GridItem;
    market: GridItem;
    cast?: GridItem;
  };
}

export interface ProposalSpaceConfig {
  defaultTabNames: string[];
  defaultFidgets: {
    proposal: FidgetInstanceData;
    tldr: FidgetInstanceData;
    voting: FidgetInstanceData;
  };
  layout: {
    proposal: GridItem;
    tldr: GridItem;
    voting: GridItem;
  };
}

export interface HomebaseSpaceConfig {
  defaultTabNames: string[];
  defaultFidgets: {
    onboarding: FidgetInstanceData;
  };
  layout: {
    onboarding: GridItem;
  };
  onboarding: {
    tutorialText: string;
    styling: {
      fontFamily: string;
      fontColor: string;
      headingsFontFamily: string;
      headingsFontColor: string;
      backgroundColor: string;
      borderColor: string;
    };
  };
}

export interface GridItem {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  moved?: boolean;
  static?: boolean;
  resizeHandles?: string[];
  isBounded?: boolean;
}
```

### 2.2 Create Configuration Loader

**File: `src/config/index.ts`**
```typescript
import { SystemConfig } from './systemConfig';
import { nounsConfig } from './nouns.config';

export const getSystemConfig = (): SystemConfig => {
  const community = process.env.NEXT_PUBLIC_COMMUNITY || 'nouns';
  
  switch (community) {
    case 'nouns':
      return nounsConfig;
    case 'custom':
      return customConfig;
    default:
      return nounsConfig;
  }
};

export const systemConfig = getSystemConfig();
```

### 2.3 Create Configuration Hook

**File: `src/hooks/useSystemConfig.ts`**
```typescript
import { useContext } from 'react';
import { SystemConfigContext } from '@/context/SystemConfigProvider';

export const useSystemConfig = (): SystemConfig => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within SystemConfigProvider');
  }
  return context;
};
```

### 2.4 Create Configuration Provider

**File: `src/context/SystemConfigProvider.tsx`**
```typescript
import React, { createContext, useContext } from 'react';
import { SystemConfig } from '@/config/systemConfig';
import { systemConfig } from '@/config';

const SystemConfigContext = createContext<SystemConfig | null>(null);

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SystemConfigContext.Provider value={systemConfig}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export { SystemConfigContext };
```

## Phase 3: Extract Nouns Configuration

### 3.1 Create Nouns Configuration

**File: `src/config/nouns.config.ts`**
```typescript
import { SystemConfig } from './systemConfig';
import { nounsFAQ } from '@/content/nouns/faq';
import { nounsLearning } from '@/content/nouns/learning';
import { nounsTutorial } from '@/content/nouns/tutorial';
import { nounsSections } from '@/content/nouns/sections';
import { nounsTheme } from '@/config/themes/nouns.theme';
import { nounsFidgets } from '@/config/fidgets/nouns.fidgets';
import { nounsNavigation } from '@/config/navigation/nouns.navigation';

export const nounsConfig: SystemConfig = {
  brand: {
    name: "Nounspace",
    displayName: "Nouns",
    tagline: "A space for Nouns",
    description: "The customizable web3 social app, built on Farcaster",
    website: "https://nouns.com",
    social: {
      farcaster: "nouns",
      discord: "nouns",
      twitter: "nouns"
    }
  },
  assets: {
    logo: "/brands/nouns/logo.png",
    favicon: "/brands/nouns/favicon.ico",
    appleTouchIcon: "/brands/nouns/apple-touch-icon.png",
    ogImage: "/brands/nouns/og-image.png",
    splashImage: "/brands/nouns/splash.png",
    heroImage: "/brands/nouns/hero.png",
    communityIcon: "/brands/nouns/community-icon.png"
  },
  theme: {
    primaryColor: "#F05252",
    secondaryColor: "#FFFAFA",
    accentColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    fontFamily: "Londrina Solid",
    headingFont: "Work Sans",
    customTheme: nounsTheme
  },
  community: {
    type: 'nouns',
    governance: {
      contractAddress: "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
      subgraphUrl: "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn",
      proposalUrl: "https://nouns.com/vote",
      votingUrl: "https://nouns.com/vote"
    },
    token: {
      contractAddress: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
      symbol: "NOUN",
      name: "Nouns",
      decimals: 0,
      chainId: 1
    },
    auction: {
      contractAddress: "0x830BD73E4184ceF73443C15111a1DF14e495C706",
      subgraphUrl: "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn",
      backgroundHex: "#F05252"
    }
  },
  content: {
    faq: nounsFAQ,
    learning: nounsLearning,
    tutorial: nounsTutorial,
    sections: nounsSections
  },
  fidgets: nounsFidgets,
  navigation: nounsNavigation,
  homePage: nounsHomePage,
  spaces: nounsSpaces
};
```

### 3.2 Extract Content Files

**File: `src/content/nouns/faq.ts`**
```typescript
export const nounsFAQ = [
  {
    question: "What is a Noun?",
    answer: "A Noun is a one-of-a-kind 32x32 pixel art character created daily as part of the Nouns project..."
  },
  {
    question: "What is Nouns DAO?",
    answer: "Nouns is a community-driven project that creates and funds creative ideas and public initiatives..."
  },
  {
    question: "How do daily auctions work?",
    answer: "Every day at 12:00 PM EST, a new Noun is auctioned off to the highest bidder..."
  }
];
```

**File: `src/content/nouns/tutorial.ts`**
```typescript
export const nounsTutorial = {
  title: "Welcome to Nounspace",
  steps: [
    {
      title: "Customization Mode",
      content: "Click the paintbrush in the bottom-left corner to open Customization Mode"
    },
    {
      title: "Add Fidgets",
      content: "1. Click the blue **+** button.\n2. Drag a Fidget to an open spot on the grid.\n3. Click Save"
    }
  ],
  images: [
    "https://space.mypinata.cloud/ipfs/bafkreiczpd2bzyoboj6uxr65kta5cmg3bziveq2nz5egx4fuxr2nmkthru"
  ]
};
```

### 3.3 Extract Theme Configuration

**File: `src/config/themes/nouns.theme.ts`**
```typescript
export const nounsTheme = {
  id: "nounish",
  name: "Nounish",
  properties: {
    font: "Londrina Solid",
    fontColor: "#333333",
    headingsFont: "Work Sans",
    headingsFontColor: "#000000",
    background: "#ffffff",
    backgroundHTML: nounishBackground,
    fidgetBackground: "#FFFAFA",
    fidgetBorderColor: "#F05252",
    fidgetBorderWidth: "2px",
    fidgetBorderRadius: "12px",
    fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
    gridSpacing: "16"
  }
};
```

### 3.4 Extract Fidget Configuration

**File: `src/config/fidgets/nouns.fidgets.ts`**
```typescript
export const nounsFidgets = {
  enabled: [
    'nounsHome',
    'governance',
    'feed',
    'cast',
    'gallery',
    'text',
    'iframe',
    'links',
    'video',
    'channel',
    'profile',
    'snapshot',
    'swap',
    'rss',
    'market',
    'portfolio',
    'chat',
    'builderScore',
    'framesV2'
  ],
  disabled: ['example'],
  custom: [],
  defaultLayout: {
    layoutFidget: "grid",
    layout: [
      {
        w: 12,
        h: 10,
        x: 0,
        y: 0,
        i: "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01",
        minW: 2,
        maxW: 36,
        minH: 2,
        maxH: 36,
        moved: false,
        static: false
      }
    ]
  }
};
```

### 3.5 Extract Home Page Configuration

**File: `src/config/home/nouns.home.ts`**
```typescript
export const nounsHomePage = {
  defaultTab: "Nouns",
  tabOrder: ["Nouns", "Social", "Governance", "Resources", "Funded Works", "Places"],
  tabs: {
    "Nouns": {
      name: "Nouns",
      displayName: "Nouns",
      layoutID: "88b78f73-37fb-4921-9410-bc298311c0bb",
      layoutDetails: {
        layoutConfig: {
          layout: [
            {
              w: 12, h: 10, x: 0, y: 0,
              i: "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01",
              minW: 2, maxW: 36, minH: 2, maxH: 36,
              moved: false, static: false,
              resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              isBounded: false
            }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "Homebase-Tab 4 - 1-Theme",
        name: "Homebase-Tab 4 - 1-Theme",
        properties: {
          background: "#ffffff",
          backgroundHTML: "",
          fidgetBackground: "#ffffff",
          fidgetBorderColor: "#eeeeee",
          fidgetBorderRadius: "0px",
          fidgetBorderWidth: "0px",
          fidgetShadow: "none",
          font: "Inter",
          fontColor: "#000000",
          gridSpacing: "0",
          headingsFont: "Inter",
          headingsFontColor: "#000000",
          musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804"
        }
      },
      fidgetInstanceDatums: {
        "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01": {
          config: {
            data: {},
            editable: true,
            settings: {
              background: "var(--user-theme-fidget-background)",
              fidgetBorderColor: "var(--user-theme-fidget-border-color)",
              fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
              fidgetShadow: "var(--user-theme-fidget-shadow)",
              showOnMobile: true,
              isScrollable: true,
              headingsFontFamily: "Londrina Solid",
              fontFamily: "Poppins"
            }
          },
          fidgetType: "nounsHome",
          id: "nounsHome:3a8d7f19-3e77-4c2b-9c7f-1a6f5f5a6f01"
        }
      },
      fidgetTrayContents: [],
      isEditable: false,
      timestamp: "2025-06-20T05:58:44.080Z"
    },
    "Social": {
      // Social tab configuration
    },
    "Governance": {
      // Governance tab configuration
    },
    "Resources": {
      // Resources tab configuration
    },
    "Funded Works": {
      // Funded Works tab configuration
    },
    "Places": {
      // Places tab configuration
    }
  },
  layout: {
    defaultLayoutFidget: "grid",
    gridSpacing: 16,
    theme: {
      background: "#ffffff",
      fidgetBackground: "#ffffff",
      font: "Inter",
      fontColor: "#000000"
    }
  }
};
```

### 3.6 Extract Initial Space Configuration

**File: `src/config/spaces/nouns.spaces.ts`**
```typescript
export const nounsSpaces = {
  base: {
    layoutID: "",
    layoutDetails: {
      layoutConfig: { layout: [] },
      layoutFidget: "grid",
    },
    theme: DEFAULT_THEME,
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
            // ... market settings
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
```

## Phase 4: Update Components to Use Configuration

### 4.1 Update Layout Components

**File: `src/app/layout.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const metadata: Metadata = {
  title: systemConfig.brand.name,
  description: systemConfig.brand.description,
  openGraph: {
    siteName: systemConfig.brand.name,
    title: systemConfig.brand.name,
    type: "website",
    description: systemConfig.brand.description,
    images: {
      url: `${WEBSITE_URL}${systemConfig.assets.ogImage}`,
      type: "image/png",
      width: 1200,
      height: 737,
    },
    url: WEBSITE_URL,
  },
  icons: {
    icon: [
      { url: systemConfig.assets.favicon },
      { url: systemConfig.assets.favicon, sizes: "32x32" },
      { url: systemConfig.assets.favicon, sizes: "16x16" },
    ],
    apple: systemConfig.assets.appleTouchIcon,
  },
};
```

### 4.2 Update Metadata Generation

**File: `src/app/(spaces)/s/[handle]/layout.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export async function generateMetadata({ params }): Promise<Metadata> {
  const config = useSystemConfig();
  
  const spaceFrame = {
    version: "next",
    imageUrl: ogImageUrl,
    button: {
      title: `Visit ${displayName}'s Space`,
      action: {
        type: "launch_frame",
        url: frameUrl,
        name: `${displayName}'s ${config.brand.name}`,
        splashImageUrl: `${WEBSITE_URL}${config.assets.splashImage}`,
        splashBackgroundColor: "#FFFFFF",
      }
    }
  };

  return {
    title: `${displayName}'s Space | ${config.brand.name}`,
    description: userMetadata?.bio || 
      `${displayName}'s customized space on ${config.brand.name}, the customizable web3 social app built on Farcaster.`,
    other: {
      'fc:frame': JSON.stringify(spaceFrame),
    },
  };
}
```

### 4.3 Update Fidget Registry

**File: `src/fidgets/index.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const getCompleteFidgets = () => {
  const config = useSystemConfig();
  const allFidgets = {
    // ... all fidget definitions
  };

  // Filter based on configuration
  const enabledFidgets = {};
  config.fidgets.enabled.forEach(key => {
    if (allFidgets[key]) {
      enabledFidgets[key] = allFidgets[key];
    }
  });

  return enabledFidgets;
};
```

### 4.4 Update Content Components

**File: `src/fidgets/nouns-home/components/Sections.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const FAQ_ITEMS = () => {
  const config = useSystemConfig();
  return config.content.faq;
};

export const LEARN_POSTS = () => {
  const config = useSystemConfig();
  return config.content.learning;
};
```

### 4.5 Update Home Page Components

**File: `src/app/home/[tabname]/page.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

const Home = () => {
  const config = useSystemConfig();
  
  // Use configuration for tab ordering
  const tabOrdering = config.homePage.tabOrder;
  const defaultTab = config.homePage.defaultTab;
  
  const getTabConfig = (tabName: string) => {
    return config.homePage.tabs[tabName] || config.homePage.tabs[defaultTab];
  };

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHomebase={false}
      currentTab={currentTabName ?? defaultTab}
      tabList={tabOrdering}
      defaultTab={defaultTab}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName: currentTabName ?? defaultTab })}
      renameTab={async () => Promise.resolve(void 0)}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
      isEditable={false}
    />
  );

  const args: SpacePageArgs = {
    config: getTabConfig(currentTabName ?? defaultTab) as SpaceConfig,
    saveConfig: async () => {},
    commitConfig: async () => {},
    resetConfig: async () => {},
    tabBar: tabBar,
  };

  return <SpacePage key={currentTabName} {...args} />;
};
```

**File: `src/app/home/[tabname]/homePageTabsConfig.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const getHomePageTabsConfig = () => {
  const config = useSystemConfig();
  return config.homePage.tabs;
};

// Export individual tab configs for backward compatibility
export const NOUNS_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Nouns"];
};

export const SOCIAL_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Social"];
};

export const GOVERNANCE_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Governance"];
};

export const RESOURCES_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Resources"];
};

export const FUNDED_WORKS_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Funded Works"];
};

export const PLACES_TAB_CONFIG = () => {
  const config = useSystemConfig();
  return config.homePage.tabs["Places"];
};
```

### 4.6 Update Space Creation Components

**File: `src/constants/initialProfileSpace.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const createInitialProfileSpaceConfigForFid = (
  fid: number,
  username?: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = useSystemConfig();
  const spaceConfig = config.spaces.profile;
  
  const profileConfig = cloneDeep(config.spaces.base);
  profileConfig.tabNames = spaceConfig.defaultTabNames;
  
  // Create fidget instances with dynamic values
  profileConfig.fidgetInstanceDatums = {
    "feed:profile": {
      ...spaceConfig.defaultFidgets.feed,
      config: {
        ...spaceConfig.defaultFidgets.feed.config,
        settings: {
          ...spaceConfig.defaultFidgets.feed.config.settings,
          users: fid,
        },
      },
    },
    "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e": {
      ...spaceConfig.defaultFidgets.portfolio,
      config: {
        ...spaceConfig.defaultFidgets.portfolio.config,
        settings: {
          ...spaceConfig.defaultFidgets.portfolio.config.settings,
          farcasterUsername: username ?? "",
        },
      },
    },
  };
  
  // Create layout with dynamic positioning
  const layoutItems = [
    {
      ...spaceConfig.layout.feed,
      i: "feed:profile",
    },
    {
      ...spaceConfig.layout.portfolio,
      i: "Portfolio:cd627e89-d661-4255-8c4c-2242a950e93e",
    },
  ];
  
  const layoutConfig = getLayoutConfig(profileConfig.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  return profileConfig;
};
```

**File: `src/constants/initialChannelSpace.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const createInitialChannelSpaceConfig = (
  channelId: string,
): Omit<SpaceConfig, "isEditable"> => {
  const config = useSystemConfig();
  const spaceConfig = config.spaces.channel;
  
  const channelConfig = cloneDeep(config.spaces.base);
  channelConfig.tabNames = spaceConfig.defaultTabNames;
  
  // Create fidget instances with dynamic values
  channelConfig.fidgetInstanceDatums = {
    "feed:channel": {
      ...spaceConfig.defaultFidgets.feed,
      config: {
        ...spaceConfig.defaultFidgets.feed.config,
        settings: {
          ...spaceConfig.defaultFidgets.feed.config.settings,
          channel: channelId,
        },
      },
    },
  };
  
  // Create layout with dynamic positioning
  const layoutItems = [
    {
      ...spaceConfig.layout.feed,
      i: "feed:channel",
    },
  ];
  
  const layoutConfig = getLayoutConfig(channelConfig.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  return channelConfig;
};
```

**File: `src/constants/initialTokenSpace.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const createInitialTokenSpaceConfigForAddress = (
  address: string,
  castHash: string | null,
  casterFid: string | null,
  symbol: string,
  isClankerToken: boolean,
  network: EtherScanChainName = "base"
): Omit<SpaceConfig, "isEditable"> => {
  const config = useSystemConfig();
  const spaceConfig = config.spaces.token;
  
  const tokenConfig = cloneDeep(config.spaces.base);
  tokenConfig.tabNames = spaceConfig.defaultTabNames;
  
  // Create fidget instances with dynamic values
  tokenConfig.fidgetInstanceDatums = {
    "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1": {
      ...spaceConfig.defaultFidgets.swap,
      config: {
        ...spaceConfig.defaultFidgets.swap.config,
        settings: {
          ...spaceConfig.defaultFidgets.swap.config.settings,
          defaultBuyToken: address,
          fromChain: getNetworkWithId(network),
          toChain: getNetworkWithId(network),
        },
      },
    },
    "market:token-market": {
      ...spaceConfig.defaultFidgets.market,
      config: {
        ...spaceConfig.defaultFidgets.market.config,
        settings: {
          ...spaceConfig.defaultFidgets.market.config.settings,
          tokenAddress: address,
          network: network,
        },
      },
    },
    // Add cast fidget if it's a Clanker token
    ...(isClankerToken && castHash && casterFid && castHash !== "clank.fun deployment" && {
      "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71": {
        ...spaceConfig.defaultFidgets.cast,
        config: {
          ...spaceConfig.defaultFidgets.cast.config,
          settings: {
            ...spaceConfig.defaultFidgets.cast.config.settings,
            castHash: castHash,
            casterFid: casterFid,
          },
        },
      },
    }),
  };
  
  // Create layout with dynamic positioning
  const layoutItems = [
    {
      ...spaceConfig.layout.swap,
      i: "Swap:f9e0259a-4524-4b37-a261-9f3be26d4af1",
    },
    {
      ...spaceConfig.layout.market,
      i: "market:token-market",
    },
    ...(isClankerToken && castHash && casterFid && castHash !== "clank.fun deployment" ? [{
      ...spaceConfig.layout.cast,
      i: "cast:9c63b80e-bd46-4c8e-9e4e-c6facc41bf71",
    }] : []),
  ];
  
  const layoutConfig = getLayoutConfig(tokenConfig.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  return tokenConfig;
};
```

**File: `src/constants/initialProposalSpace.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const createInitalProposalSpaceConfigForProposalId = (
  proposalId: string,
  proposerAddress: Address
): Omit<SpaceConfig, "isEditable"> => {
  const config = useSystemConfig();
  const spaceConfig = config.spaces.proposal;
  
  const proposalConfig = cloneDeep(config.spaces.base);
  proposalConfig.tabNames = spaceConfig.defaultTabNames;
  
  // Create fidget instances with dynamic values
  proposalConfig.fidgetInstanceDatums = {
    "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1": {
      ...spaceConfig.defaultFidgets.proposal,
      config: {
        ...spaceConfig.defaultFidgets.proposal.config,
        settings: {
          ...spaceConfig.defaultFidgets.proposal.config.settings,
          url: `https://www.nouns.camp/proposals/${proposalId}?tab=description`,
        },
      },
    },
    "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d": {
      ...spaceConfig.defaultFidgets.tldr,
      config: {
        ...spaceConfig.defaultFidgets.tldr.config,
        settings: {
          ...spaceConfig.defaultFidgets.tldr.config.settings,
          url: `https://euphonious-kulfi-5e5a30.netlify.app/?id=${proposalId}`,
        },
      },
    },
    "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a": {
      ...spaceConfig.defaultFidgets.voting,
      config: {
        ...spaceConfig.defaultFidgets.voting.config,
        settings: {
          ...spaceConfig.defaultFidgets.voting.config.settings,
          url: `https://nouns.wtf/vote/${proposalId}`,
        },
      },
    },
  };
  
  // Create layout with dynamic positioning
  const layoutItems = [
    {
      ...spaceConfig.layout.proposal,
      i: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
    },
    {
      ...spaceConfig.layout.tldr,
      i: "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d",
    },
    {
      ...spaceConfig.layout.voting,
      i: "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a",
    },
  ];
  
  const layoutConfig = getLayoutConfig(proposalConfig.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  return proposalConfig;
};
```

**File: `src/constants/initialHomebase.ts`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const createInitialHomebaseConfig = (): SpaceConfig => {
  const config = useSystemConfig();
  const spaceConfig = config.spaces.homebase;
  
  const homebaseConfig = cloneDeep(config.spaces.base);
  homebaseConfig.tabNames = spaceConfig.defaultTabNames;
  homebaseConfig.isEditable = true;
  
  // Create fidget instances with dynamic values
  homebaseConfig.fidgetInstanceDatums = {
    "text:onboarding": {
      ...spaceConfig.defaultFidgets.onboarding,
      config: {
        ...spaceConfig.defaultFidgets.onboarding.config,
        settings: {
          ...spaceConfig.defaultFidgets.onboarding.config.settings,
          text: spaceConfig.onboarding.tutorialText,
          fontFamily: spaceConfig.onboarding.styling.fontFamily,
          fontColor: spaceConfig.onboarding.styling.fontColor,
          headingsFontFamily: spaceConfig.onboarding.styling.headingsFontFamily,
          headingsFontColor: spaceConfig.onboarding.styling.headingsFontColor,
          backgroundColor: spaceConfig.onboarding.styling.backgroundColor,
          borderColor: spaceConfig.onboarding.styling.borderColor,
        },
      },
    },
  };
  
  // Create layout with dynamic positioning
  const layoutItems = [
    {
      ...spaceConfig.layout.onboarding,
      i: "text:onboarding",
    },
  ];
  
  const layoutConfig = getLayoutConfig(homebaseConfig.layoutDetails);
  layoutConfig.layout = layoutItems;
  
  return homebaseConfig;
};
```

## Phase 5: Create Dynamic Components

### 5.1 Create System Logo Component

**File: `src/components/SystemLogo.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface SystemLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SystemLogo: React.FC<SystemLogoProps> = ({ className, size = 'md' }) => {
  const config = useSystemConfig();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <img
      src={config.assets.logo}
      alt={config.brand.name}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};
```

### 5.2 Create System Theme Component

**File: `src/components/SystemTheme.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export const SystemTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useSystemConfig();
  
  const themeStyles = {
    '--primary-color': config.theme.primaryColor,
    '--secondary-color': config.theme.secondaryColor,
    '--accent-color': config.theme.accentColor,
    '--background-color': config.theme.backgroundColor,
    '--text-color': config.theme.textColor,
    '--font-family': config.theme.fontFamily,
    '--heading-font': config.theme.headingFont,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="system-theme">
      {children}
    </div>
  );
};
```

### 5.3 Create System Content Component

**File: `src/components/SystemContent.tsx`**
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface SystemContentProps {
  type: 'faq' | 'learning' | 'tutorial' | 'hero' | 'about' | 'features';
  className?: string;
}

export const SystemContent: React.FC<SystemContentProps> = ({ type, className }) => {
  const config = useSystemConfig();
  
  const renderContent = () => {
    switch (type) {
      case 'faq':
        return (
          <div className={className}>
            {config.content.faq.map((item, index) => (
              <div key={index}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        );
      case 'learning':
        return (
          <div className={className}>
            {config.content.learning.map((resource, index) => (
              <div key={index}>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a href={resource.url}>Learn More</a>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return renderContent();
};
```

## Phase 6: Migration Strategy

### 6.1 Gradual Migration Approach

1. **Create configuration system** (Phase 2)
2. **Extract Nouns configuration** (Phase 3)
3. **Update components one by one** (Phase 4)
4. **Test each component** after update
5. **Create dynamic components** (Phase 5)
6. **Replace hardcoded references** gradually

### 6.2 Testing Strategy

- [ ] Create unit tests for configuration system
- [ ] Create integration tests for dynamic components
- [ ] Test with different community configurations
- [ ] Ensure all functionality works with configuration

### 6.3 Rollback Plan

- [ ] Keep original files as backup
- [ ] Use feature flags to enable/disable configuration
- [ ] Create migration scripts to revert changes
- [ ] Test rollback procedures

## Implementation Timeline

- **Week 1**: Phase 1 - Audit and catalog
- **Week 2**: Phase 2 - Create infrastructure
- **Week 3**: Phase 3 - Extract Nouns configuration
- **Week 4**: Phase 4 - Update components
- **Week 5**: Phase 5 - Create dynamic components
- **Week 6**: Phase 6 - Testing and migration

**Total**: 6 weeks for complete extraction and implementation

## Success Criteria

- [ ] All Nouns references are configurable
- [ ] New community can be added by changing configuration
- [ ] All functionality works with different configurations
- [ ] Performance is not impacted
- [ ] Code is maintainable and extensible

This approach provides a systematic way to extract all whitelabel variables while maintaining functionality and allowing for easy community customization.

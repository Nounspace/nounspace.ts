# Whitelabel System Configuration

This document outlines how to create a systemConfig for whitelabeling the Nounspace application, allowing it to be rebranded for different communities while maintaining the same core functionality.

## Overview

The whitelabel system extracts all Nouns-specific branding, theming, and community integrations into a configurable systemConfig that can be swapped to rebrand the entire application for different communities.

## Current Nouns-Specific Elements

### 1. Branding & Metadata
- **App Name**: "Nounspace" → "CommunitySpace"
- **App Description**: "The customizable web3 social app, built on Farcaster"
- **Logo Assets**: `nounspace_logo.png`, `nounspace_og_low.png`
- **Favicon**: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`
- **App Icons**: `icon-192x192.png`, `icon-512x512.png`
- **Apple Touch Icon**: `apple-touch-icon.png`

### 2. Community-Specific Assets
- **Nouns Logo**: `nouns_yellow_logo.jpg`
- **Noggles**: `noggles.svg`
- **Community Images**: `nouns-samples/` directory
- **Learning Assets**: `learn/` directory (governance.png, noggles.png, what-are-nouns.png)

### 3. Theming & Visual Identity
- **Nounish Theme**: Custom theme with Nouns-specific styling
- **Color Palette**: Nouns yellow (#F05252), specific brand colors
- **Fonts**: Londrina Solid, Work Sans for Nouns branding
- **Backgrounds**: Nounish animated backgrounds

### 4. Community Integrations
- **Nouns DAO**: Governance integration, proposal tracking
- **Nouns Home Fidget**: Community homepage with auction data
- **Nouns Governance Fidget**: DAO-specific governance tools
- **Based DAOs**: Integration with other Nounish communities

### 5. Content & Copy
- **FAQ Content**: Nouns-specific questions and answers
- **Learning Resources**: Nouns 101, governance guides
- **Community Links**: Farcaster channels, Discord, etc.
- **Tutorial Content**: Nouns-specific onboarding

## SystemConfig Structure

### Core Configuration

```typescript
interface SystemConfig {
  // Brand Identity
  brand: {
    name: string;                    // "Nounspace" → "CommunitySpace"
    displayName: string;             // "Nouns" → "Community"
    tagline: string;                // "A space for Nouns" → "A space for Community"
    description: string;             // App description
    website: string;                 // Community website
    social: {
      farcaster: string;            // Farcaster channel
      discord?: string;             // Discord server
      twitter?: string;             // Twitter handle
    };
  };

  // Visual Assets
  assets: {
    logo: string;                   // Main logo path
    logoDark?: string;              // Dark mode logo
    favicon: string;                // Favicon path
    appleTouchIcon: string;         // Apple touch icon
    ogImage: string;                // Open Graph image
    splashImage: string;            // App splash screen
    heroImage: string;              // Hero section image
    communityIcon: string;          // Community-specific icon
  };

  // Theming
  theme: {
    primaryColor: string;           // Primary brand color
    secondaryColor: string;         // Secondary brand color
    accentColor: string;            // Accent color
    backgroundColor: string;         // Default background
    textColor: string;              // Default text color
    fontFamily: string;             // Primary font
    headingFont: string;            // Heading font
    customTheme?: ThemeConfig;      // Custom theme configuration
  };

  // Community Integration
  community: {
    type: 'nouns' | 'custom';       // Community type
    governance?: {
      contractAddress?: string;      // Governance contract
      subgraphUrl?: string;         // Subgraph URL
      proposalUrl?: string;         // Proposals URL
      votingUrl?: string;           // Voting URL
    };
    token?: {
      contractAddress: string;       // Token contract
      symbol: string;               // Token symbol
      name: string;                 // Token name
      decimals: number;              // Token decimals
      chainId: number;               // Chain ID
    };
    auction?: {
      contractAddress: string;      // Auction contract
      subgraphUrl: string;          // Auction subgraph
      backgroundHex: string;        // Auction background
    };
  };

  // Content & Copy
  content: {
    faq: FAQItem[];                 // Community-specific FAQ
    learning: LearningResource[];   // Learning resources
    tutorial: TutorialContent;      // Onboarding tutorial
    sections: {
      hero: HeroSection;            // Hero section content
      about: AboutSection;          // About section
      features: FeatureSection[];  // Feature highlights
    };
  };

  // Fidget Configuration
  fidgets: {
    enabled: string[];              // Enabled fidgets
    disabled: string[];              // Disabled fidgets
    custom: CustomFidget[];         // Custom community fidgets
    defaultLayout: FidgetLayout;    // Default fidget layout
  };

  // Navigation & Structure
  navigation: {
    homeTabs: TabConfig[];           // Homepage tabs
    exploreCategories: Category[];   // Explore categories
    footerLinks: FooterLink[];       // Footer links
  };
}
```

### Detailed Type Definitions

```typescript
interface ThemeConfig {
  id: string;
  name: string;
  properties: {
    font: string;
    fontColor: string;
    headingsFont: string;
    headingsFontColor: string;
    background: string;
    backgroundHTML?: string;
    fidgetBackground: string;
    fidgetBorderColor: string;
    fidgetBorderWidth: string;
    fidgetBorderRadius: string;
    fidgetShadow: string;
    gridSpacing: string;
    musicURL?: string;
  };
}

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface LearningResource {
  title: string;
  description: string;
  url: string;
  image: string;
  category: string;
}

interface TutorialContent {
  title: string;
  steps: TutorialStep[];
  images: string[];
}

interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
}

interface CustomFidget {
  id: string;
  name: string;
  component: React.ComponentType;
  category: string;
  description: string;
}

interface TabConfig {
  name: string;
  displayName: string;
  config: SpaceConfig;
  icon?: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}
```

## Implementation Strategy

### Phase 1: Extract Current Nouns Configuration

**Tasks**:
- [ ] Create `src/config/nouns.config.ts` - Extract all Nouns-specific configuration
- [ ] Create `src/config/systemConfig.ts` - Define SystemConfig interface
- [ ] Create `src/config/index.ts` - Configuration loader
- [ ] Extract Nouns assets to `public/brands/nouns/`
- [ ] Extract Nouns content to `src/content/nouns/`

### Phase 2: Create Configuration System

**Tasks**:
- [ ] Create `src/hooks/useSystemConfig.ts` - React hook for config access
- [ ] Create `src/context/SystemConfigProvider.tsx` - Context provider
- [ ] Create `src/utils/configLoader.ts` - Configuration loading utilities
- [ ] Update all hardcoded references to use systemConfig

### Phase 3: Implement Whitelabel Features

**Tasks**:
- [ ] Create `src/components/SystemLogo.tsx` - Dynamic logo component
- [ ] Create `src/components/SystemTheme.tsx` - Dynamic theming
- [ ] Create `src/components/SystemContent.tsx` - Dynamic content
- [ ] Update metadata generation to use systemConfig
- [ ] Update fidget registry to use systemConfig

### Phase 4: Create Community Templates

**Tasks**:
- [ ] Create `src/config/communities/` directory
- [ ] Create template configurations for different community types
- [ ] Create asset templates and guidelines
- [ ] Create documentation for community setup

## Configuration Examples

### Nouns Configuration
```typescript
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
    customTheme: nounishTheme
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
    sections: {
      hero: nounsHero,
      about: nounsAbout,
      features: nounsFeatures
    }
  },
  fidgets: {
    enabled: ['nounsHome', 'governance', 'feed', 'cast', 'gallery', 'text'],
    disabled: ['example'],
    custom: [],
    defaultLayout: nounsDefaultLayout
  },
  navigation: {
    homeTabs: nounsHomeTabs,
    exploreCategories: nounsCategories,
    footerLinks: nounsFooterLinks
  }
};
```

### Custom Community Configuration
```typescript
export const customCommunityConfig: SystemConfig = {
  brand: {
    name: "CommunitySpace",
    displayName: "Community",
    tagline: "A space for our community",
    description: "The customizable web3 social app for our community",
    website: "https://community.com",
    social: {
      farcaster: "community",
      discord: "community",
      twitter: "community"
    }
  },
  assets: {
    logo: "/brands/community/logo.png",
    favicon: "/brands/community/favicon.ico",
    // ... other assets
  },
  theme: {
    primaryColor: "#6366F1",
    secondaryColor: "#F8FAFC",
    accentColor: "#1E293B",
    backgroundColor: "#ffffff",
    textColor: "#334155",
    fontFamily: "Inter",
    headingFont: "Inter"
  },
  community: {
    type: 'custom',
    // Custom community configuration
  },
  content: {
    faq: communityFAQ,
    learning: communityLearning,
    tutorial: communityTutorial,
    sections: {
      hero: communityHero,
      about: communityAbout,
      features: communityFeatures
    }
  },
  fidgets: {
    enabled: ['feed', 'cast', 'gallery', 'text', 'iframe'],
    disabled: ['nounsHome', 'governance'],
    custom: [customCommunityFidget],
    defaultLayout: communityDefaultLayout
  },
  navigation: {
    homeTabs: communityHomeTabs,
    exploreCategories: communityCategories,
    footerLinks: communityFooterLinks
  }
};
```

## File Structure

```
src/
├── config/
│   ├── systemConfig.ts          # SystemConfig interface
│   ├── index.ts                 # Configuration loader
│   ├── nouns.config.ts          # Nouns configuration
│   └── communities/             # Community templates
│       ├── template.config.ts   # Base template
│       ├── nouns.config.ts      # Nouns template
│       └── custom.config.ts      # Custom template
├── content/
│   ├── nouns/                   # Nouns-specific content
│   │   ├── faq.ts
│   │   ├── learning.ts
│   │   ├── tutorial.ts
│   │   └── sections.ts
│   └── communities/             # Other community content
├── components/
│   ├── SystemLogo.tsx           # Dynamic logo
│   ├── SystemTheme.tsx         # Dynamic theming
│   └── SystemContent.tsx       # Dynamic content
├── hooks/
│   └── useSystemConfig.ts       # Config access hook
├── context/
│   └── SystemConfigProvider.tsx # Config context
└── utils/
    └── configLoader.ts          # Configuration utilities

public/
├── brands/
│   ├── nouns/                   # Nouns assets
│   │   ├── logo.png
│   │   ├── favicon.ico
│   │   ├── og-image.png
│   │   └── ...
│   └── communities/             # Other community assets
│       └── community/
│           ├── logo.png
│           ├── favicon.ico
│           └── ...
```

## Usage Examples

### Dynamic Logo
```typescript
import { SystemLogo } from '@/components/SystemLogo';

export function Header() {
  return (
    <header>
      <SystemLogo />
    </header>
  );
}
```

### Dynamic Content
```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

export function HeroSection() {
  const config = useSystemConfig();
  
  return (
    <section>
      <h1>{config.content.sections.hero.title}</h1>
      <p>{config.content.sections.hero.description}</p>
    </section>
  );
}
```

### Dynamic Theming
```typescript
import { SystemTheme } from '@/components/SystemTheme';

export function App() {
  return (
    <SystemConfigProvider>
      <SystemTheme>
        <AppContent />
      </SystemTheme>
    </SystemConfigProvider>
  );
}
```

## Benefits

✅ **Easy Rebranding** - Swap configuration to rebrand entire app
✅ **Community Customization** - Tailor experience for different communities
✅ **Maintainable** - Centralized configuration management
✅ **Scalable** - Easy to add new communities
✅ **Flexible** - Support for custom themes, content, and features
✅ **Developer Friendly** - Clear separation of concerns

## Migration Strategy

1. **Extract Current Nouns Config** - Move all Nouns-specific elements to configuration
2. **Create Configuration System** - Build the infrastructure for dynamic configuration
3. **Update Components** - Replace hardcoded references with dynamic ones
4. **Test Thoroughly** - Ensure all functionality works with configuration
5. **Create Templates** - Build community templates for easy setup
6. **Document Process** - Create guides for community setup

This system would allow the Nounspace application to be easily rebranded for any community while maintaining all the core functionality and customization features.

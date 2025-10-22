# Whitelabeling System

This document describes the whitelabeling system that enables community customization of the Nounspace application.

## Overview

The whitelabeling system allows different communities to customize the application's branding, theming, content, and functionality through a centralized configuration system. This enables the same codebase to serve multiple communities with different identities.

## Architecture

### System Configuration Structure

```typescript
interface SystemConfig {
  brand: BrandConfig;           // Brand identity
  assets: AssetConfig;          // Visual assets
  theme: ThemeConfig;           // Theming system
  community: CommunityConfig;   // Community integration
  fidgets: FidgetConfig;        // Fidget management
  homePage: HomePageConfig;     // Home page configuration
}
```

### Configuration Files

```
src/config/
├── brand/
│   └── nouns.brand.ts         # Brand name, tagline, description
├── assets/
│   └── nouns.assets.ts        # Logos, icons, images
├── theme/
│   └── nouns.theme.ts         # Colors, fonts, backgrounds
├── community/
│   └── nouns.community.ts     # URLs, contracts, tokens
├── fidgets/
│   └── nouns.fidgets.ts       # Enabled/disabled fidgets
├── spaces/
│   ├── nouns.home.ts          # Home page configuration
│   └── initial*.ts            # Initial space templates
└── systemConfig.ts            # Main configuration interface
```

## Configuration Components

### 1. Brand Configuration

Controls the application's brand identity:

```typescript
interface BrandConfig {
  name: string;              // Internal name (e.g., "nounspace")
  displayName: string;       // Display name (e.g., "Nounspace")
  tagline: string;           // Brand tagline
  description: string;       // Brand description
}
```

**Usage**: Applied to page titles, metadata, and brand elements throughout the application.

### 2. Asset Configuration

Manages visual assets and logos:

```typescript
interface AssetConfig {
  logos: {
    main: string;            // Main logo
    icon: string;            // Favicon
    favicon: string;         // Favicon file
    appleTouch: string;      // Apple touch icon
    og: string;              // OpenGraph image
    splash: string;          // Splash screen image
  };
}
```

**Usage**: Applied to favicons, OpenGraph images, splash screens, and branding elements.

### 3. Theme Configuration

Controls the visual styling system:

```typescript
interface ThemeConfig {
  default: ThemeProperties;
  nounish: ThemeProperties;
  gradientAndWave: ThemeProperties;
  // ... other theme variants
}
```

**Usage**: Applied to the theme system, allowing communities to customize colors, fonts, and visual styling.

### 4. Community Configuration

Manages community-specific integrations:

```typescript
interface CommunityConfig {
  type: string;              // Community type identifier
  urls: {                    // Community URLs
    website: string;
    discord: string;
    twitter: string;
    github: string;
    forum: string;
  };
  social: {                  // Social media handles
    farcaster: string;
    discord: string;
    twitter: string;
  };
  governance: {              // Governance links
    proposals: string;
    delegates: string;
    treasury: string;
  };
  tokens: {                  // Token information
    noun: TokenInfo;
    nounsToken: TokenInfo;
  };
  contracts: {               // Contract addresses
    nouns: string;
    auctionHouse: string;
    space: string;
    nogs: string;
  };
}
```

**Usage**: Applied to community links, social media integration, governance features, and contract interactions.

### 5. Fidget Configuration

Controls which fidgets are available:

```typescript
interface FidgetConfig {
  enabled: string[];         // Available fidgets
  disabled: string[];        // Hidden fidgets
}
```

**Usage**: Applied to the fidget picker and available functionality, allowing communities to enable/disable specific features.

### 6. Home Page Configuration

Manages the home page layout and content:

```typescript
interface HomePageConfig {
  defaultTab: string;        // Default tab name
  tabOrder: string[];        // Tab ordering
  tabs: {                    // Tab configurations
    [key: string]: TabConfig;
  };
}
```

**Usage**: Applied to the home page structure, allowing communities to customize their landing page experience.

## Implementation

### Configuration Loading

The system uses a centralized configuration loader:

```typescript
// src/config/index.ts
export const loadSystemConfig = (): SystemConfig => {
  // Currently returns nounsSystemConfig
  // Future: Load different configs based on environment or criteria
  return nounsSystemConfig;
};
```

### Usage in Components

Components access configuration through the `useSystemConfig` hook:

```typescript
import { useSystemConfig } from '@/hooks/useSystemConfig';

const MyComponent = () => {
  const config = useSystemConfig();
  
  return (
    <div>
      <h1>{config.brand.displayName}</h1>
      <img src={config.assets.logos.main} alt={config.brand.name} />
    </div>
  );
};
```

### Current Integration Points

The configuration system is currently integrated into:

- **Application Layout** (`src/app/layout.tsx`): Metadata, OpenGraph, favicons
- **Home Page** (`src/app/home/[tabname]/page.tsx`): Tab configuration and ordering
- **Theme System** (`src/constants/themes.ts`): Theme definitions
- **Community Integration** (`src/constants/basedDaos.ts`, `src/constants/nogs.ts`, `src/constants/spaceToken.ts`): Contract addresses and community settings


## Best Practices

### Configuration Design

1. **Keep it Simple**: Only include configuration that actually needs to be customizable
2. **Type Safety**: Use TypeScript interfaces for all configuration
3. **Documentation**: Document all configuration options and their usage
4. **Validation**: Validate configuration at load time

### Community Customization

1. **Focused Customization**: Focus on community identity, not individual fidget functionality
2. **Asset Management**: Provide clear guidelines for asset requirements
3. **Theme Consistency**: Ensure theme configurations maintain visual consistency
4. **Testing**: Test configurations across different devices and browsers

## Migration Notes

### Recent Changes

The whitelabeling system has been refined to focus on essential customization:

- **Removed**: Unused content configuration (FAQ, learning materials, tutorial text)
- **Removed**: Excessive fidget configuration (custom arrays, default layouts)
- **Removed**: Unused token ABI files
- **Simplified**: Community configuration to focus on essential community integration
- **Consolidated**: Initial space configurations into the config system

### Current Status

The system is now **trim and focused** on the essential aspects of community customization:

- ✅ **Brand Identity**: Name, tagline, description
- ✅ **Visual Assets**: Logos, icons, images
- ✅ **Theme System**: Colors, fonts, backgrounds
- ✅ **Community Integration**: URLs, social handles, contracts
- ✅ **Fidget Management**: Enable/disable functionality
- ✅ **Home Page Configuration**: Tab structure and ordering

This provides a solid foundation for community whitelabeling while keeping the system maintainable and focused.

# Tag-Based FidgetPicker System

## Overview

The FidgetPicker has been reworked from a strict categories system to a flexible tagging system focused on 8 core categories. Each fidget can have multiple tags, making discovery and filtering much more powerful while maintaining simplicity. All tags use a consistent lowercase, hyphenated format for better organization and searchability.

## Core Categories

The system is built around 8 main categories:

### 1. **Social** 👥
- Social interaction features
- Farcaster ecosystem tools
- Communication and networking
- **Examples**: Feed, Cast, Chat, Profile, Instagram, TikTok, SkateHive

### 2. **DeFi** 💰
- Decentralized finance applications
- Trading, swapping, lending, yield farming
- Portfolio management and analytics
- **Examples**: Swap, Market, Portfolio, Aave, Uniswap, Aerodrome, Clanker

### 3. **Tools** 🔧
- Utility and productivity tools
- Scheduling, networking, workspace tools
- Web integration and embedding
- **Examples**: IFrame, Links, RSS, Calendly, Notion, Talent Protocol

### 4. **Content** 🎨
- Content creation and display
- Media, art, writing, publishing
- NFT marketplaces and galleries
- **Examples**: Gallery, Text, Video, Paragraph, Mirror

### 5. **Games** 🎮
- Gaming and entertainment
- Interactive games and platforms
- Web3 gaming experiences
- **Examples**: Blackhole, Betr, Ponder, Cat Town, $EGGS, Bracket, Framedl

### 6. **Governance** 🗳️
- DAO governance and voting
- Treasury management
- Decentralized decision making
- **Examples**: Governance, Snapshot

### 7. **Mini Apps** 📱
- Farcaster Frame applications
- External integrations
- Specialized tools and utilities
- **Examples**: All mini-apps from Farcaster API, Noice, Frame apps from Farcaster API

### 8. **Social Impact** ❤️
- Social impact and community building
- Donation platforms and governance
- Community-driven initiatives
- **Examples**: Giveth, Public Nouns, Flows, Octant

## Key Features

### 1. Multiple Tags Per Fidget
- Each fidget has a primary category tag plus specific functionality tags
- Tags are displayed as colored chips on each fidget card
- Up to 3 tags are shown, with a "+N" indicator for additional tags

### 2. Tag-Based Filtering
- **Single-select filtering**: Select one tag to filter fidgets
- **Toggle behavior**: Click the same tag again to clear the filter
- **Visual feedback**: Selected tag is highlighted with a ring and shadow
- **Clear filter**: Easy way to reset the current filter

### 3. Enhanced Search
- Search works independently of tag filtering
- Searches across name, description, and tags
- More accurate results when searching for specific functionality

### 4. Dynamic Mini-App Integration
- **Automatic Fetching**: Mini-apps are automatically fetched from Farcaster API
- **Smart Categorization**: Mini-apps are intelligently categorized based on their tags and metadata
- **Real-time Updates**: Mini-apps are cached for 5 minutes and refreshed automatically
- **Fallback Handling**: If API fails, the system continues to work with other fidget types

## Mini-App Categorization

The system automatically categorizes mini-apps from the Farcaster API based on their metadata:

### Category Mapping Logic
1. **Primary Category**: Uses the app's `primaryCategory` field if available
2. **Tag Analysis**: Analyzes the app's tags for additional context
3. **Fallback**: Defaults to "mini-apps" category if no clear categorization

### Category Mapping Examples
- `social` → **social** category
- `defi`, `finance` → **defi** category  
- `games`, `entertainment` → **games** category
- `art-creativity`, `art`, `media` → **content** category
- `utility`, `tool`, `productivity` → **tools** category
- `governance` → **governance** category

### Tag-Based Analysis
If no primary category is specified, the system analyzes app tags:
- Tags containing "social", "community" → **social**
- Tags containing "defi", "finance", "trading", "swap" → **defi**
- Tags containing "games", "gaming", "play" → **games**
- Tags containing "art", "content", "media", "nft" → **content**
- Tags containing "tools", "utility", "productivity" → **tools**
- Tags containing "governance", "voting", "dao" → **governance**

### Benefits
- **Automatic Discovery**: New mini-apps appear automatically without manual curation
- **Intelligent Organization**: Apps are categorized based on their actual functionality
- **Consistent Experience**: Mini-apps integrate seamlessly with the existing fidget system
- **Real-time Updates**: New apps from Farcaster appear in the picker within 5 minutes

## Tag Structure

### Primary Category Tags
Every fidget has one of the 8 core categories as its primary tag:
- `social`, `defi`, `tools`, `content`, `games`, `governance`, `mini-apps`, `social-impact`

### Specific Functionality Tags
Additional tags describe specific functionality:
- `farcaster` - Farcaster ecosystem integration
- `swap` - Token swapping functionality
- `trading` - Trading features
- `nft` - NFT-related functionality
- `voting` - Voting systems
- `dao` - DAO functionality
- `analytics` - Data analysis tools
- `blockchain` - Blockchain interaction
- `lending` - Lending protocols
- `yield` - Yield farming
- `marketplace` - Marketplace functionality
- `publishing` - Content publishing
- `writing` - Text content creation
- `art` - Artistic content
- `price` - Price tracking
- `tracking` - Asset tracking
- `explorer` - Blockchain explorers
- `dashboards` - Data dashboards
- `treasury` - Treasury management
- `aggregator` - Data aggregation
- `stablecoin` - Stablecoin operations
- `vaults` - Yield vaults
- `borrowing` - Borrowing protocols
- `dex` - Decentralized exchanges
- `utility` - General utilities
- `donation` - Donation platforms
- `community` - Community features
- `instagram` - Instagram integration
- `tiktok` - TikTok integration
- `skateboarding` - Skateboarding community
- `aerodrome` - Aerodrome protocol
- `clanker` - Clanker analytics
- `scheduling` - Scheduling tools
- `presentations` - Presentation tools
- `productivity` - Productivity tools
- `networking` - Networking features
- `interactive` - Interactive features
- `betting` - Betting platforms
- `fishing` - Fishing games
- `eggs` - Egg-themed content
- `frames` - Frame applications
- `noice` - Noice platform
- `miniapp` - Mini app functionality
- `gaming` - Gaming features
- `entertainment` - Entertainment content
- `media` - Media content

## Usage Examples

### Finding Social Fidgets
1. Click on the `social` tag
2. See all fidgets related to social features
3. Click `social` again to clear the filter

### Finding DeFi Tools
1. Click on `defi` tag
2. See all DeFi-related fidgets
3. Use search to find specific functionality like "trading"

### Finding Content Creation Tools
1. Click on `content` tag
2. See all content-related fidgets
3. Use search to find specific platforms like "Mirror"

### Finding Social Impact Projects
1. Click on `social-impact` tag
2. See all social impact and community building tools
3. Results will show Giveth, Public Nouns, Flows, Octant

### Finding Mini Apps
1. Click on `mini-apps` tag
2. See all mini-apps from Farcaster API
3. Results will show all available frame applications

### Searching for Specific Functionality
1. Type "farcaster" in search
2. Results prioritize fidgets with "farcaster" in their tags
3. Also shows fidgets with "farcaster" in name or description

## Technical Implementation

### Tag Generation
Static fidgets are mapped to the 8 core categories:

```typescript
// Example: Feed fidget
tags: ['social', 'farcaster', 'feed']

// Example: Swap fidget  
tags: ['defi', 'swap', 'trading', 'dex']

// Example: Gallery fidget
tags: ['content', 'gallery']

// Example: Giveth fidget
tags: ['social-impact', 'donation', 'giveth']

// Example: Mini-app from Farcaster
tags: ['social', 'farcaster', 'social', 'app-name', 'mini-apps']
```

### Mini-App Tag Structure
All mini-apps from the Farcaster API receive a consistent tag structure:
1. **Primary Category**: Based on app metadata (social, defi, games, etc.)
2. **Specific Tags**: App-specific functionality tags
3. **App Name**: Normalized app name as a tag
4. **Mini Apps**: Universal tag for all Farcaster mini-apps

This ensures that:
- Mini-apps appear in their appropriate category sections
- All mini-apps can be found by selecting the "mini-apps" category
- Users can filter by both specific categories and the general "mini-apps" tag

### Filtering Logic
```typescript
// Single tag filtering
filtered = fidgets.filter(option => 
  selectedTag ? option.tags.includes(selectedTag) : true
);
```

## Benefits

1. **Simplicity**: Clear 8-category system that's easy to understand
2. **Flexibility**: Fidgets can belong to multiple categories through specific tags
3. **Better Discovery**: Users can find fidgets through multiple pathways
4. **Improved Search**: Tag-based search provides more relevant results
5. **Visual Clarity**: Tags provide immediate context about fidget functionality
6. **Scalability**: Easy to add new specific tags without changing core categories
7. **Consistency**: All tags use lowercase, hyphenated format for better organization
8. **Automatic Integration**: Mini-apps are automatically categorized and tagged

## Future Enhancements

- Tag-based sorting options
- Tag analytics and popularity
- User-defined tags
- Tag-based recommendations
- Category-specific layouts or themes 
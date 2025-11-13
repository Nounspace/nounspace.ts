# Directory Fidget

The Directory fidget displays member directories from multiple data sources, with support for token holders, Farcaster channels, and CSV uploads.

## Overview

The Directory fidget is a powerful tool for displaying lists of members, token holders, or community members. It supports three data sources and provides rich display options including sorting, filtering, and pagination.

## Features

- **Multiple Data Sources**: Token holders, Farcaster channels, or CSV uploads
- **Rich Member Profiles**: ENS names, avatars, social links, token balances
- **Flexible Display**: Cards or list layout, customizable sorting and filtering
- **Pagination**: Client-side pagination for large directories
- **Auto-refresh**: Automatic refresh detection based on settings changes or data staleness
- **Manual Refresh**: Always-available refresh button

## Data Sources

### 1. Token Holders

Display ERC-20 token or NFT holders from supported networks.

**Configuration:**
- **Network**: Base, Polygon, or Ethereum Mainnet
- **Contract Address**: ERC-20 token or NFT contract address
- **Asset Type**: Token or NFT
- **Include Filter**: All holders or only holders with Farcaster accounts

**Features:**
- Token balance display
- Aggregation by Farcaster FID (combines multiple addresses)
- ENS name and avatar resolution
- Social media links (Twitter/X, GitHub)
- Etherscan links

**Example:**
```
Network: Base
Contract Address: 0x1234...5678
Asset Type: Token
Include: Holders with Farcaster Account
```

### 2. Farcaster Channel

Display members or followers from a Farcaster channel.

**Configuration:**
- **Channel Name**: Farcaster channel name (e.g., "nouns")
- **Channel Filter**: Members, Followers, or All

**Features:**
- Farcaster profile information (username, display name, PFP)
- Follower counts
- Primary address extraction
- Social media links
- Debounced input (800ms) to reduce API calls

**Example:**
```
Channel Name: nouns
Channel Filter: Members
```

### 3. CSV Upload

Upload a custom CSV file with addresses, FIDs, or usernames.

**Configuration:**
- **CSV Type**: Address, FID, or Farcaster username
- **CSV Sort By**: Followers or CSV order
- **Upload CSV**: File upload input

**CSV Format:**
- **Address**: First column should contain Ethereum addresses
- **FID**: First column should contain Farcaster FIDs
- **Username**: First column should contain Farcaster usernames (without @)

**Features:**
- Automatic header detection
- Batch processing for large files
- FID lookup for usernames
- ENS resolution for addresses
- Duplicate prevention

**Example CSV (Username):**
```csv
username
alice
bob
charlie
```

**Example CSV (Address):**
```csv
address
0x1234...5678
0xabcd...ef01
```

## Display Options

### Layout Styles

- **Cards**: Grid layout with member cards showing avatar, name, and details
- **List**: Compact list layout with member rows

### Sorting Options

- **Token Holdings**: Sort by token balance (token holders only)
- **Followers**: Sort by Farcaster follower count
- **CSV Order**: Maintain original CSV order (CSV source only)

### Filtering

- **Include Filter** (Token Holders only):
  - **Holders with Farcaster Account**: Only show holders who have linked Farcaster accounts
  - **All Holders**: Show all token holders regardless of Farcaster account

### Pagination

- Client-side pagination
- Configurable page size (default: 20 members per page)
- Page controls with previous/next buttons
- Current page indicator

## Configuration

### Required Settings

**Token Holders:**
- `source`: "tokenHolders"
- `network`: "base" | "polygon" | "mainnet"
- `contractAddress`: Valid Ethereum address (42 characters)
- `assetType`: "token" | "nft"

**Farcaster Channel:**
- `source`: "farcasterChannel"
- `channelName`: Non-empty string

**CSV:**
- `source`: "csv"
- `csvType`: "address" | "fid" | "username"
- CSV file uploaded

### Optional Settings

- `subheader`: Custom subheader text (auto-generated if empty)
- `sortBy`: Sort option
- `layoutStyle`: "cards" | "list"
- `include`: Include filter (token holders only)
- `channelFilter`: Channel filter (Farcaster channel only)
- `csvSortBy`: CSV sort option
- `primaryFontFamily`: Custom font for headings
- `primaryFontColor`: Custom color for headings
- `secondaryFontFamily`: Custom font for body text
- `secondaryFontColor`: Custom color for body text

## Auto-Generated Subheaders

If no custom subheader is provided, the Directory fidget automatically generates subheaders:

- **Token Holders**: `{tokenSymbol} • {network}` (e.g., "USDC • Base")
- **Farcaster Channel**: `/{channelName}` (e.g., "/nouns")
- **CSV**: No auto-generated subheader

## Refresh Behavior

### Automatic Refresh

The Directory fidget automatically refreshes data when:

1. **Settings Change**: Any relevant setting changes (network, contract address, channel name, etc.)
2. **Data Staleness**: Data is older than 5 minutes
3. **Initial Load**: No previous data exists

### Manual Refresh

A "Refresh Members" button is always available for manual refresh, regardless of source type.

### Refresh Detection

The fidget uses `lastFetchSettings` stored in `config.data` to detect when settings have changed. After each data fetch, a snapshot of the settings used for that fetch is stored (including source, network, contract address, and asset type for token holders). When the current settings differ from this snapshot, a refresh is automatically triggered.

## Data Enrichment

### ENS Resolution

All addresses are enriched with ENS metadata:
- ENS name
- ENS avatar
- Primary address resolution

### Farcaster Profile Enrichment

Members are enriched with Farcaster profile data via Neynar API:
- Username
- Display name
- Profile picture (PFP)
- Follower count
- Social media links (Twitter/X, GitHub)

### Token Balance Formatting

Token balances are formatted with appropriate decimals and symbols.

## Performance Considerations

### Debouncing

- **Channel Name Input**: 800ms debounce to reduce API calls while typing

### Caching

- Fetched data is cached in `config.data` (stored in Zustand store)
- Data includes `lastUpdatedTimestamp` for staleness detection
- Settings snapshots stored in `lastFetchSettings` (for backfill system)
- **No local state** - data flows directly from store → component → store

### AbortController

- All fetch operations use `AbortController` for cancellation
- Prevents race conditions when settings change rapidly
- Cleanup on component unmount

### Refresh Detection

- **Settings changes**: React dependencies automatically detect when fetch-relevant settings change
- **Staleness**: Separate effect watches timestamp and refreshes if data is older than 5 minutes
- **Initial load**: Only fetches if no data exists in store
- **No comparison logic**: React's dependency system handles change detection

## Error Handling

### Error States

- **Network Errors**: Displayed with clear error messages
- **Invalid Configuration**: Validation prevents invalid configurations
- **Empty Results**: Friendly empty state messages

### Error Recovery

- Errors don't block future fetches (no suppression needed)
- Manual refresh always available
- Settings changes reset error state automatically
- React's dependency system prevents infinite retry loops

## Examples

### Token Holders Directory

A typical token holders configuration includes:
- Source set to "tokenHolders"
- Network selection (e.g., "base" for Base network)
- Contract address of the token (e.g., USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- Asset type of "token" or "nft"
- Include filter to show only holders with Farcaster accounts
- Sort by token holdings
- Cards layout style for visual browsing

### Farcaster Channel Directory

A Farcaster channel configuration includes:
- Source set to "farcasterChannel"
- Channel name (e.g., "nouns")
- Channel filter set to "members" to show channel members
- Sort by follower count
- List layout for compact display

### CSV Directory

A CSV-based directory configuration includes:
- Source set to "csv"
- CSV type indicating the format (address, fid, or username)
- Sort option (followers or CSV order)
- Cards layout for visual display
- CSV content stored in the csvContent field after upload

## Best Practices

1. **Use Appropriate Source**: Choose the data source that best fits your use case
2. **Configure Filters**: Use include filters to focus on relevant members
3. **Choose Layout**: Cards for visual browsing, list for quick scanning
4. **Monitor Performance**: Large directories benefit from pagination
5. **Handle Errors**: Provide fallback content for error states
6. **Cache Data**: Leverage automatic caching for better performance

## Related Documentation

- [Fidget Overview](OVERVIEW.md) - General fidget architecture
- [Data Field Patterns](DATA_FIELD_PATTERNS.md) - Patterns for using config.data
- [Settings Backfill](SETTINGS_BACKFILL.md) - Automatic settings backfill


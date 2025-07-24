# Mini App Discovery System

## Overview

Nounspace implements a decentralized Mini App discovery system that follows the same approach used by official Farcaster clients. This system automatically discovers, validates, and indexes Mini Apps from across the web without relying on a centralized API.

## How It Works

### 1. Domain Discovery & Crawling

The system discovers Mini Apps through multiple seed sources:

- **Public Casts**: Scans Farcaster casts for URLs with `fc:miniapp` meta tags
- **Developer Tools**: Extracts domains from the developer tool's hosted manifest section
- **Public Registries**: Queries community-maintained index sites and GitHub repositories

### 2. Manifest Validation

For each discovered domain, the system:

1. Fetches `https://<domain>/.well-known/farcaster.json`
2. Validates the manifest structure (name, iconUrl, homeUrl are required)
3. Verifies URLs are valid and accessible
4. Checks that image URLs return valid image content
5. Excludes development tunnels (ngrok.io, replit.dev, etc.)

### 3. Engagement Monitoring

Only apps that meet engagement thresholds are indexed:

- Minimum usage count requirements
- Recent activity tracking
- User adoption metrics
- Trending activity analysis

### 4. Scheduling & Re-indexing

- **Daily Re-indexing**: All discovered apps are re-crawled every 24 hours
- **Manual Triggers**: Users can trigger immediate re-indexing
- **Cache Management**: Intelligent caching with configurable TTL

## Architecture

### Core Components

```
src/common/data/services/
├── miniAppDiscoveryService.ts    # Main discovery service
├── fidgetOptionsService.ts       # Integration with fidget system
└── ...

src/app/api/
├── miniapp-discovery/route.ts    # API endpoints
└── ...

src/common/components/molecules/
├── MiniAppDiscoveryPanel.tsx     # UI for discovery management
└── ...

src/common/lib/hooks/
├── useMiniAppDiscovery.ts        # React hook for discovery
└── ...
```

### Service Architecture

```typescript
MiniAppDiscoveryService
├── Domain Discovery
│   ├── extractDomainsFromCasts()
│   ├── getDomainsFromDeveloperTools()
│   └── getDomainsFromRegistries()
├── Crawling Engine
│   ├── startCrawling()
│   ├── crawlDomain()
│   └── fetchManifest()
├── Validation
│   ├── validateManifest()
│   ├── validateImageUrl()
│   └── isValidDomain()
└── Management
    ├── scheduleReindexing()
    ├── getStats()
    └── clearCache()
```

## Usage

### API Endpoints

#### GET `/api/miniapp-discovery`
Returns discovery statistics and list of valid apps.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalDiscovered": 150,
    "validApps": 120,
    "invalidApps": 30,
    "queueLength": 5,
    "isCrawling": false
  },
  "validApps": 120,
  "apps": [
    {
      "domain": "app.example.com",
      "name": "Example App",
      "description": "A great Mini App",
      "lastCrawled": "2024-01-15T10:30:00Z",
      "engagementScore": 85
    }
  ]
}
```

#### POST `/api/miniapp-discovery`
Triggers discovery actions.

**Actions:**
- `discover` - Start discovery from seed sources
- `add-domains` - Add specific domains to crawl queue
- `reindex` - Re-index all discovered apps
- `clear-cache` - Clear cache and force re-discovery

**Example:**
```json
{
  "action": "add-domains",
  "domains": ["app.example.com", "another-app.com"]
}
```

### React Components

#### MiniAppDiscoveryPanel
A complete UI component for managing discovery:

```tsx
import { MiniAppDiscoveryPanel } from '@/common/components/molecules/MiniAppDiscoveryPanel';

function AdminPage() {
  return (
    <div>
      <h1>Mini App Discovery</h1>
      <MiniAppDiscoveryPanel />
    </div>
  );
}
```

#### useMiniAppDiscovery Hook
A React hook for programmatic access:

```tsx
import { useMiniAppDiscovery } from '@/common/lib/hooks/useMiniAppDiscovery';

function MyComponent() {
  const {
    stats,
    isInitialized,
    error,
    triggerDiscovery,
    addDomainsToQueue,
    reindexAll,
    clearCache
  } = useMiniAppDiscovery();

  return (
    <div>
      {stats && (
        <div>
          <p>Valid Apps: {stats.validApps}</p>
          <p>Total Discovered: {stats.totalDiscovered}</p>
        </div>
      )}
      <button onClick={triggerDiscovery}>Discover Apps</button>
    </div>
  );
}
```

## Configuration

### DiscoveryConfig

```typescript
interface DiscoveryConfig {
  maxConcurrentCrawls: number;    // Default: 10
  crawlTimeout: number;           // Default: 10000ms
  retryAttempts: number;          // Default: 3
  cacheDuration: number;          // Default: 24 hours
  engagementThreshold: number;    // Default: 10
  excludePatterns: RegExp[];      // Development tunnels
}
```

### Custom Configuration

```typescript
import { MiniAppDiscoveryService } from '@/common/data/services/miniAppDiscoveryService';

const discoveryService = MiniAppDiscoveryService.getInstance({
  maxConcurrentCrawls: 20,
  crawlTimeout: 15000,
  engagementThreshold: 5,
  excludePatterns: [
    /ngrok\.io$/,
    /replit\.dev$/,
    /localhost$/,
    /\.test$/,
    /\.dev$/
  ]
});
```

## Integration with Fidget System

Discovered Mini Apps are automatically integrated into the existing fidget system:

1. **Automatic Categorization**: Apps are categorized based on their metadata
2. **Tag Generation**: Intelligent tag generation for better discovery
3. **Popularity Scoring**: Engagement-based popularity calculation
4. **Seamless Integration**: Apps appear in the fidget picker alongside curated apps

### FidgetOption Format

```typescript
{
  id: `discovered-miniapp-${domain}-${index}`,
  type: 'miniapp',
  name: manifest.name,
  description: manifest.description,
  icon: manifest.iconUrl,
  tags: ['mini-apps', 'discovered', appName],
  category: 'mini-apps',
  frameUrl: manifest.homeUrl,
  homeUrl: manifest.homeUrl,
  domain: domain,
  popularity: engagementScore
}
```

## Best Practices

### For Developers

1. **Proper Manifest Structure**: Ensure your `/.well-known/farcaster.json` includes all required fields
2. **Valid Image URLs**: Make sure iconUrl returns a valid image with proper content-type headers
3. **Production Domains**: Only use production domains, not development tunnels
4. **Regular Updates**: Keep your manifest up-to-date with current information

### For Administrators

1. **Monitor Discovery Stats**: Use the discovery panel to monitor system health
2. **Adjust Thresholds**: Configure engagement thresholds based on your needs
3. **Seed Management**: Maintain and update seed domain sources
4. **Cache Management**: Clear cache periodically to ensure fresh data

### For Users

1. **Share Mini Apps**: Share Mini Apps in casts to trigger faster indexing
2. **Report Issues**: Report invalid or broken Mini Apps
3. **Provide Feedback**: Help improve the discovery system with feedback

## Troubleshooting

### Common Issues

1. **Apps Not Appearing**
   - Check if the app meets engagement thresholds
   - Verify the manifest is valid and accessible
   - Ensure the domain is not excluded

2. **Discovery Not Working**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Review server logs for errors

3. **Performance Issues**
   - Adjust concurrent crawl limits
   - Increase timeout values
   - Optimize seed domain lists

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
NEXT_PUBLIC_DEBUG_DISCOVERY=true
```

This will log detailed information about the discovery process.

## Future Enhancements

1. **Advanced Analytics**: More sophisticated engagement scoring
2. **Machine Learning**: AI-powered app categorization
3. **Community Curation**: User-submitted app recommendations
4. **Real-time Updates**: WebSocket-based real-time discovery updates
5. **Cross-Client Sync**: Synchronization with other Farcaster clients

## Contributing

To contribute to the Mini App discovery system:

1. **Add Seed Sources**: Implement new domain discovery methods
2. **Improve Validation**: Enhance manifest validation logic
3. **Optimize Performance**: Improve crawling efficiency
4. **Add Features**: Implement new discovery features

## References

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/miniapps)
- [Mini App Discovery Guide](https://docs.farcaster.xyz/guides/discovery)
- [Manifest Specification](https://docs.farcaster.xyz/miniapps/manifest)
- [Official Client Implementation](https://github.com/farcasterxyz/hub-monorepo) 
import { CompleteFidgets } from "@/fidgets";
import { 
  FidgetOption, 
  StaticFidgetOption, 
  CuratedFidgetOption, 
  MiniAppFidgetOption,
  FarcasterFrameApp,
  FidgetCategory,
  FidgetSearchFilters,
  FidgetOptionsResponse 
} from "@/common/types/fidgetOptions";
import { CURATED_SITES } from "@/common/data/curated/curatedSites";

// Default categories configuration
const DEFAULT_CATEGORIES: FidgetCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    description: 'Essential fidgets for new users',

    order: 0
  },
  {
    id: 'social',
    name: 'Social',
    icon: '👥',
    description: 'Connect and engage with others',

    order: 1
  },
  {
    id: 'defi',
    name: 'DeFi',
    icon: '💰',
    description: 'Decentralized finance tools',

    order: 2
  },
  {
    id: 'media',
    name: 'Media',
    icon: '🎨',
    description: 'Images, videos, and creative content',

    order: 3
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: '🔧',
    description: 'Utility fidgets and productivity tools',

    order: 4
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    description: 'Entertainment and gaming',

    order: 5
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📦',
    description: 'Miscellaneous fidgets',

    order: 99
  }
];

// Static fidget category mappings
const STATIC_FIDGET_CATEGORIES: Record<string, string> = {
  'feed': 'social',
  'cast': 'social',
  'frame': 'social',
  'gallery': 'media',
  'text': 'media',
  'video': 'media',
  'iframe': 'tools',
  'governance': 'tools',
  'links': 'tools',
  'snapshot': 'tools',
  'swap': 'defi',
  'market': 'defi',
  'portfolio': 'defi',
  'chat': 'social',
  'rss': 'tools',
  'framesV2': 'tools',
  'example': 'other'
};



// Map Farcaster category to our category
const FARCASTER_CATEGORY_MAP: Record<string, string> = {
  'social': 'social',
  'defi': 'defi',
  'games': 'games',
  'art-creativity': 'media',
  'utility': 'tools',
  'entertainment': 'games',
  'productivity': 'tools',
  'finance': 'defi',
  'media': 'media',
  'tool': 'tools',
  'art': 'media',
  'nft': 'media'
};

export class FidgetOptionsService {
  private static instance: FidgetOptionsService;
  private miniAppsCache: MiniAppFidgetOption[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FidgetOptionsService {
    if (!FidgetOptionsService.instance) {
      FidgetOptionsService.instance = new FidgetOptionsService();
    }
    return FidgetOptionsService.instance;
  }

  // Get all static fidgets from CompleteFidgets
  private getStaticFidgets(): StaticFidgetOption[] {
    const staticFidgets: StaticFidgetOption[] = [];
    
    Object.entries(CompleteFidgets).forEach(([key, fidgetModule]) => {
      if (fidgetModule) {
        staticFidgets.push({
          id: `static-${key}`,
          type: 'static',
          fidgetType: key,
          name: fidgetModule.properties.fidgetName,
          description: `${fidgetModule.properties.fidgetName} fidget`,
          icon: String.fromCodePoint(fidgetModule.properties.icon),
          tags: [key, 'builtin'],
          category: STATIC_FIDGET_CATEGORIES[key] || 'other',
          popularity: ['feed', 'cast', 'gallery', 'text'].includes(key) ? 100 : 50
        });
      }
    });

    return staticFidgets;
  }

  // Get curated iframe sites
  private getCuratedSites(): CuratedFidgetOption[] {
    return CURATED_SITES.map((site, index) => ({
      ...site,
      id: `curated-${index}`
    }));
  }

  // Fetch mini-apps from Farcaster API
  private async fetchMiniApps(): Promise<MiniAppFidgetOption[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://client.farcaster.xyz/v1/top-frameapps?limit=50', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Farcaster API Response:', responseData);
      
      // Handle different response structures
      let frameApps: FarcasterFrameApp[] = [];
      
      if (Array.isArray(responseData)) {
        frameApps = responseData;
      } else if (
        responseData && 
        responseData.result && 
        responseData.result.frames && 
        Array.isArray(responseData.result.frames)
      ) {
        // Actual Farcaster API structure: { result: { frames: [...] } }
        frameApps = responseData.result.frames;
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        frameApps = responseData.data;
      } else if (responseData && responseData.apps && Array.isArray(responseData.apps)) {
        frameApps = responseData.apps;
      } else {
        console.error('Unexpected API response structure:', responseData);
        return [];
      }
      
      return frameApps.map((app, index) => ({
        id: `miniapp-${app.domain}-${index}`,
        type: 'miniapp' as const,
        name: app.name,
        description: app.description || app.tagline || app.ogDescription || `${app.name} frame app`,
        icon: app.iconUrl || app.splashImageUrl || '🔗',
        tags: app.tags || [],
        category: (app.primaryCategory ? FARCASTER_CATEGORY_MAP[app.primaryCategory] : null) || 'other',
        frameUrl: app.homeUrl,
        homeUrl: app.homeUrl,
        domain: app.domain,
        author: app.author,
        buttonTitle: app.buttonTitle || 'Open',
        imageUrl: app.imageUrl || app.ogImageUrl || app.heroImageUrl,
        splashImageUrl: app.splashImageUrl,
        splashBackgroundColor: app.splashBackgroundColor,
        subtitle: app.subtitle,
        screenshotUrls: app.screenshotUrls || [],
        popularity: Math.max(50 - index, 0) + (
          app.author?.followerCount 
            ? Math.min(Math.floor(app.author.followerCount / 1000), 50) 
            : 0
        ) // Factor in follower count for popularity
      }));
    } catch (error) {
      console.error('Error fetching mini-apps from Farcaster API:', error);
      
      // Return empty array if API fails - the rest of the fidget picker will still work
      return [];
    }
  }

  // Get cached mini-apps or fetch if cache is expired
  private async getMiniApps(): Promise<MiniAppFidgetOption[]> {
    const now = Date.now();
    if (this.miniAppsCache && now < this.cacheExpiry) {
      return this.miniAppsCache;
    }

    this.miniAppsCache = await this.fetchMiniApps();
    this.cacheExpiry = now + this.CACHE_DURATION;
    return this.miniAppsCache;
  }

  // Filter options based on search criteria
  private filterOptions(options: FidgetOption[], filters: FidgetSearchFilters): FidgetOption[] {
    let filtered = options;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(option => 
        option.name.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(option => option.category === filters.category);
    }

    if (filters.type) {
      filtered = filtered.filter(option => option.type === filters.type);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(option => 
        filters.tags!.some(tag => option.tags.includes(tag))
      );
    }



    return filtered;
  }

  // Main method to get all fidget options
  async getFidgetOptions(filters: FidgetSearchFilters = {}): Promise<FidgetOptionsResponse> {
    const [staticFidgets, curatedSites, miniApps] = await Promise.all([
      Promise.resolve(this.getStaticFidgets()),
      Promise.resolve(this.getCuratedSites()),
      this.getMiniApps()
    ]);

    const allOptions: FidgetOption[] = [
      ...staticFidgets,
      ...curatedSites,
      ...miniApps
    ];

    // Deduplicate by name (keep the first occurrence)
    const seenNames = new Set<string>();
    const duplicates: string[] = [];
    const deduplicatedOptions = allOptions.filter(option => {
      if (seenNames.has(option.name)) {
        duplicates.push(option.name);
        return false;
      }
      seenNames.add(option.name);
      return true;
    });

    // Log duplicates found for debugging
    if (duplicates.length > 0) {
      console.log('Duplicate fidget options removed:', duplicates);
    }

    // Sort by popularity (desc) then by name (asc)
    deduplicatedOptions.sort((a, b) => {
      if (a.popularity !== b.popularity) {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      return a.name.localeCompare(b.name);
    });

    const filteredOptions = this.filterOptions(deduplicatedOptions, filters);

    return {
      options: filteredOptions,
      categories: DEFAULT_CATEGORIES,
      total: filteredOptions.length,
      hasMore: false // For future pagination
    };
  }

  // Get categories only
  getCategories(): FidgetCategory[] {
    return DEFAULT_CATEGORIES;
  }

  // Clear cache (for testing/refresh)
  clearCache(): void {
    this.miniAppsCache = null;
    this.cacheExpiry = 0;
  }
} 
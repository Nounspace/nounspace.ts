import { MiniAppFidgetOption, FarcasterFrameApp } from '@/common/types/fidgetOptions';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../supabase/database';

// Types for Mini App discovery
export interface MiniAppManifest {
  name: string;
  iconUrl: string;
  homeUrl: string;
  description?: string;
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  frame?: {
    version: string;
    name: string;
    homeUrl: string;
    iconUrl: string;
    splashImageUrl?: string;
    webhookUrl?: string;
    splashBackgroundColor?: string;
  };
}

export interface DiscoveredMiniApp {
  domain: string;
  manifest: MiniAppManifest;
  lastCrawled: Date;
  isValid: boolean;
  error?: string;
  engagementScore?: number;
  usageCount?: number;
  lastSeen?: Date;
  discoverySource?: 'cast_crawling' | 'registry' | 'farcaster_api' | 'developer_tools';
}

export interface DiscoveryConfig {
  maxConcurrentCrawls: number;
  crawlTimeout: number;
  retryAttempts: number;
  cacheDuration: number;
  engagementThreshold: number;
  excludePatterns: RegExp[];
}

// Default configuration
const DEFAULT_CONFIG: DiscoveryConfig = {
  maxConcurrentCrawls: 10,
  crawlTimeout: 10000, // 10 seconds
  retryAttempts: 3,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  engagementThreshold: 10, // Minimum usage count
  excludePatterns: [
    /ngrok\.io$/,
    /replit\.dev$/,
    /localhost$/,
    /127\.0\.0\.1$/,
    /\.local$/,
    /\.test$/,
    /\.dev$/,
  ],
};

export class MiniAppDiscoveryService {
  private static instance: MiniAppDiscoveryService;
  private discoveredApps: Map<string, DiscoveredMiniApp> = new Map();
  private crawlQueue: string[] = [];
  private isCrawling = false;
  private config: DiscoveryConfig;
  private lastDiscoveryRun?: Date;
  private sourceStats?: {
    casts: { success: boolean; domainsFound: number };
    registries: { success: boolean; domainsFound: number };
    developerTools: { success: boolean; domainsFound: number };
  };
  private supabase: ReturnType<typeof createClient<Database>>;
  private currentDiscoveryRunId?: number;

  private constructor(config: Partial<DiscoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  static getInstance(config?: Partial<DiscoveryConfig>): MiniAppDiscoveryService {
    if (!MiniAppDiscoveryService.instance) {
      MiniAppDiscoveryService.instance = new MiniAppDiscoveryService(config);
    }
    return MiniAppDiscoveryService.instance;
  }

  /**
   * Add domains to the discovery queue
   */
  async addDomainsToQueue(domains: string[]): Promise<void> {
    const validDomains = domains.filter(domain => this.isValidDomain(domain));
    this.crawlQueue.push(...validDomains);
    
    if (!this.isCrawling) {
      this.startCrawling();
    }
  }

  /**
   * Discover Mini Apps from seed sources
   */
  async discoverFromSeeds(): Promise<void> {
    console.log('🚀 Starting Mini App discovery from seed sources...');
    
    try {
      // Start a new discovery run
      await this.startDiscoveryRun();
      
      this.lastDiscoveryRun = new Date();
      this.sourceStats = {
        casts: { success: false, domainsFound: 0 },
        registries: { success: false, domainsFound: 0 },
        developerTools: { success: false, domainsFound: 0 },
      };
      
      // Get domains from casts
      const castDomains = await this.extractDomainsFromCasts();
      this.sourceStats.casts = { success: true, domainsFound: castDomains.length };
      
      // Get domains from registries
      const registryDomains = await this.getDomainsFromRegistries();
      this.sourceStats.registries = { success: true, domainsFound: registryDomains.length };
      
      // Get domains from developer tools
      const devToolDomains = await this.getDomainsFromDeveloperTools();
      this.sourceStats.developerTools = { success: true, domainsFound: devToolDomains.length };
      
      // Combine all domains
      const allDomains = [...castDomains, ...registryDomains, ...devToolDomains];
      const uniqueDomains = [...new Set(allDomains)];
      
      console.log(`📊 Discovery Summary:`);
      console.log(`  📡 Casts: ${castDomains.length} domains`);
      console.log(`  📚 Registries: ${registryDomains.length} domains`);
      console.log(`  🛠️  Developer Tools: ${devToolDomains.length} domains`);
      console.log(`  🎯 Total Unique: ${uniqueDomains.length} domains`);
      
      await this.addDomainsToQueue(uniqueDomains);
      
      await this.completeDiscoveryRun('completed');
      
    } catch (error) {
      console.error('❌ Discovery failed:', error);
      await this.completeDiscoveryRun('failed', error as Error);
      // Still try to add fallback domains
      const fallbackDomains = this.getFallbackDomains();
      await this.addDomainsToQueue(fallbackDomains);
    }
  }

  /**
   * Start a new discovery run in the database
   */
  private async startDiscoveryRun(): Promise<void> {
    const { data, error } = await this.supabase
      .from('discovery_runs')
      .insert({
        status: 'running',
        total_casts_processed: 0,
        total_domains_found: 0,
        new_apps_discovered: 0,
        existing_apps_updated: 0,
        validation_errors: 0,
        config: this.config as any
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to start discovery run:', error);
      return;
    }

    this.currentDiscoveryRunId = data.id;
    console.log(`📊 Started discovery run #${data.id}`);
  }

  /**
   * Complete the current discovery run
   */
  private async completeDiscoveryRun(status: 'completed' | 'failed', error?: Error): Promise<void> {
    if (!this.currentDiscoveryRunId) return;

    const { error: updateError } = await this.supabase
      .from('discovery_runs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        error_message: error?.message || null
      })
      .eq('id', this.currentDiscoveryRunId);

    if (updateError) {
      console.error('Failed to complete discovery run:', updateError);
    } else {
      console.log(`📊 Completed discovery run #${this.currentDiscoveryRunId} with status: ${status}`);
    }
  }

  /**
   * Store a discovered Mini App in the database
   */
  private async storeMiniApp(app: DiscoveredMiniApp, castHash?: string, castUrl?: string, discoverySource: 'cast_crawling' | 'registry' | 'farcaster_api' | 'developer_tools' = 'cast_crawling'): Promise<void> {
    try {
      const { data: existing } = await this.supabase
        .from('discovered_mini_apps')
        .select('id, usage_count, last_used_at')
        .eq('domain', app.domain)
        .single();

      const appData = {
        domain: app.domain,
        name: app.manifest.name,
        description: app.manifest.description || null,
        icon_url: app.manifest.iconUrl,
        home_url: app.manifest.homeUrl,
        manifest_url: `https://${app.domain}/.well-known/farcaster.json`,
        engagement_score: app.engagementScore || 0,
        is_valid: app.isValid,
        last_validated_at: new Date().toISOString(),
        manifest_data: app.manifest as any,
        discovery_source: discoverySource,
        cast_hash: castHash || null,
        cast_url: castUrl || null,
        validation_errors: app.error ? [app.error] : null,
        validation_warnings: null,
        usage_count: existing?.usage_count || 0,
        last_used_at: existing?.last_used_at || null
      };

      if (existing) {
        // Update existing app
        const { error } = await this.supabase
          .from('discovered_mini_apps')
          .update({
            ...appData,
            discovered_at: new Date().toISOString() // Keep original discovery date
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`Failed to update Mini App ${app.domain}:`, error);
        } else {
          console.log(`📝 Updated Mini App: ${app.domain}`);
        }
      } else {
        // Insert new app
        const { error } = await this.supabase
          .from('discovered_mini_apps')
          .insert({
            ...appData,
            discovered_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Failed to insert Mini App ${app.domain}:`, error);
        } else {
          console.log(`✨ Discovered new Mini App: ${app.domain}`);
        }
      }
    } catch (error) {
      console.error(`Failed to store Mini App ${app.domain}:`, error);
    }
  }

  /**
   * Load Mini Apps from database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      const { data: apps, error } = await this.supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('is_valid', true)
        .order('engagement_score', { ascending: false });

      if (error) {
        console.error('Failed to load Mini Apps from database:', error);
        return;
      }

      // Clear in-memory cache and reload from database
      this.discoveredApps.clear();
      
      for (const app of apps || []) {
        this.discoveredApps.set(app.domain, {
          domain: app.domain,
          manifest: app.manifest_data as unknown as MiniAppManifest,
          lastCrawled: new Date(app.last_validated_at || new Date()),
          isValid: app.is_valid || false,
          engagementScore: app.engagement_score || 0,
          usageCount: app.usage_count || 0,
          lastSeen: app.last_used_at ? new Date(app.last_used_at) : undefined,
          discoverySource: app.discovery_source as 'cast_crawling' | 'registry' | 'farcaster_api' | 'developer_tools'
        });
      }

      console.log(`📚 Loaded ${this.discoveredApps.size} Mini Apps from database`);
    } catch (error) {
      console.error('Failed to load Mini Apps from database:', error);
    }
  }

  /**
   * Record a cast as processed
   */
  private async recordProcessedCast(castHash: string, castData: any, domainsFound: string[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('processed_casts')
        .insert({
          cast_hash: castHash,
          discovery_run_id: this.currentDiscoveryRunId || null,
          cast_data: castData,
          domains_found: domainsFound
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Failed to record processed cast:', error);
      }
    } catch (error) {
      console.error('Failed to record processed cast:', error);
    }
  }

  /**
   * Record domain crawl history
   */
  private async recordDomainCrawl(domain: string, status: string, details: {
    httpStatus?: number;
    responseTimeMs?: number;
    errorMessage?: string;
    manifestFound?: boolean;
    manifestValid?: boolean;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('domain_crawl_history')
        .insert({
          domain,
          status,
          http_status: details.httpStatus || null,
          response_time_ms: details.responseTimeMs || null,
          error_message: details.errorMessage || null,
          manifest_found: details.manifestFound || false,
          manifest_valid: details.manifestValid || false
        });

      if (error) {
        console.error('Failed to record domain crawl:', error);
      }
    } catch (error) {
      console.error('Failed to record domain crawl:', error);
    }
  }

  /**
   * Get seed domains from various sources
   */
  private async getSeedDomains(): Promise<string[]> {
    const domains = new Set<string>();

    // 1. From public casts (simulated - in real implementation, you'd parse casts)
    const castDomains = await this.extractDomainsFromCasts();
    castDomains.forEach(domain => domains.add(domain));

    // 2. From developer tools (simulated)
    const devToolDomains = await this.getDomainsFromDeveloperTools();
    devToolDomains.forEach(domain => domains.add(domain));

    // 3. From public registries
    const registryDomains = await this.getDomainsFromRegistries();
    registryDomains.forEach(domain => domains.add(domain));

    return Array.from(domains);
  }

  /**
   * Extract domains from public casts
   */
  private async extractDomainsFromCasts(): Promise<string[]> {
    const domains = new Set<string>();
    
    try {
      // 1. Query recent casts from Farcaster API
      const recentCasts = await this.fetchRecentCasts();
      
      // 2. Query frame-specific casts (higher priority)
      const frameCasts = await this.fetchFrameCasts();
      
      // 3. Extract URLs from all casts
      const allCasts = [...recentCasts, ...frameCasts];
      const uniqueCasts = this.deduplicateCasts(allCasts);
      
      console.log(`📊 Processing ${uniqueCasts.length} unique casts...`);
      
      for (const cast of uniqueCasts) {
        const urls = this.extractUrlsFromCast(cast);
        for (const url of urls) {
          const domain = this.extractDomainFromUrl(url);
          if (domain && this.isValidDomain(domain)) {
            domains.add(domain);
          }
        }
      }
      
      console.log(`📡 Found ${domains.size} unique domains from ${uniqueCasts.length} casts`);
      
    } catch (error) {
      console.warn('⚠️  Failed to fetch casts, using fallback domains:', error);
      // Fallback to known domains if API fails
      return this.getFallbackDomains();
    }
    
    return Array.from(domains);
  }

  /**
   * Fetch frame-specific casts (higher priority for Mini App discovery)
   */
  private async fetchFrameCasts(): Promise<any[]> {
    try {
      console.log('🖼️  Fetching frame-specific casts...');
      
      // Use Neynar API to get casts with frames
      const response = await fetch('https://api.neynar.com/v2/farcaster/feed?frame=true&limit=100', {
        method: 'GET',
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || '',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const frameCasts = data.casts || [];
        console.log(`🖼️  Found ${frameCasts.length} frame casts`);
        return frameCasts;
      }
      
    } catch (error) {
      console.warn('⚠️  Failed to fetch frame casts:', error);
    }
    
    return [];
  }

  /**
   * Deduplicate casts by hash
   */
  private deduplicateCasts(casts: any[]): any[] {
    const seen = new Set<string>();
    const uniqueCasts: any[] = [];
    
    for (const cast of casts) {
      const hash = cast.hash || cast.data?.hash;
      if (hash && !seen.has(hash)) {
        seen.add(hash);
        uniqueCasts.push(cast);
      }
    }
    
    return uniqueCasts;
  }

  /**
   * Fetch recent casts from Neynar API (last 24 hours)
   */
  private async fetchRecentCasts(): Promise<any[]> {
    const allCasts: any[] = [];
    const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000); // Unix timestamp
    
    try {
      console.log('📡 Fetching casts from the past 24 hours via Neynar...');
      
      // Use Neynar API with pagination to get all recent casts
      let cursor: string | undefined;
      let totalCasts = 0;
      let pageCount = 0;
      
      do {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}...`);
        
        const url = new URL('https://api.neynar.com/v2/farcaster/feed');
        url.searchParams.set('limit', '100'); // Max limit
        if (cursor) {
          url.searchParams.set('cursor', cursor);
        }
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'api_key': process.env.NEYNAR_API_KEY || '',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Neynar API error: ${response.status}`);
        }
        
        const data = await response.json();
        const casts = data.casts || [];
        
        // Filter casts from the last 24 hours
        const recentCasts = casts.filter((cast: any) => {
          const castTimestamp = cast.timestamp || cast.created_at;
          return castTimestamp && castTimestamp >= twentyFourHoursAgo;
        });
        
        allCasts.push(...recentCasts);
        totalCasts += casts.length;
        
        // Check if we've gone too far back in time
        if (casts.length > 0) {
          const oldestCast = casts[casts.length - 1];
          const oldestTimestamp = oldestCast.timestamp || oldestCast.created_at;
          
          if (oldestTimestamp && oldestTimestamp < twentyFourHoursAgo) {
            console.log(`⏰ Reached casts older than 24 hours, stopping pagination`);
            break;
          }
        }
        
        cursor = data.next?.cursor;
        
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } while (cursor && pageCount < 50); // Safety limit of 50 pages
      
      console.log(`📊 Fetched ${totalCasts} total casts, ${allCasts.length} from last 24 hours`);
      
    } catch (error) {
      console.warn('⚠️  Neynar API failed:', error);
      throw error;
    }
    
    return allCasts;
  }

  /**
   * Extract URLs from a cast (with Mini App targeting)
   */
  private extractUrlsFromCast(cast: any): string[] {
    const urls: string[] = [];
    
    // Extract from cast text
    if (cast.text) {
      const urlRegex = /https?:\/\/[^\s]+/g;
      const matches = cast.text.match(urlRegex);
      if (matches) {
        urls.push(...matches);
      }
    }
    
    // Extract from embeds
    if (cast.embeds) {
      for (const embed of cast.embeds) {
        if (embed.url) {
          urls.push(embed.url);
        }
      }
    }
    
    // Extract from frames (high priority - these are likely Mini Apps)
    if (cast.frames) {
      for (const frame of cast.frames) {
        if (frame.url) {
          urls.push(frame.url);
        }
      }
    }
    
    // Extract from verified frames
    if (cast.verified_frames) {
      for (const frame of cast.verified_frames) {
        if (frame.url) {
          urls.push(frame.url);
        }
      }
    }
    
    // Filter for likely Mini App URLs
    const filteredUrls = urls.filter(url => this.isLikelyMiniAppUrl(url));
    
    if (filteredUrls.length > 0) {
      console.log(`🎯 Cast ${cast.hash?.slice(0, 8)}... contains ${filteredUrls.length} potential Mini App URLs`);
    }
    
    return filteredUrls;
  }

  /**
   * Check if URL is likely a Mini App
   */
  private isLikelyMiniAppUrl(url: string): boolean {
    const urlLower = url.toLowerCase();
    
    // Common Mini App patterns
    const miniAppPatterns = [
      '/frame',
      '/miniapp',
      '/app',
      'fc:frame',
      'fc:miniapp',
      'frame.wtf',
      'frames.js.org',
      'miniapps.farcaster.xyz',
      'gallery.so',
      'paragraph.xyz',
      'nouns.build',
      'degen.tips',
      'mint.fun',
      'zora.co',
      'foundation.app',
      'opensea.io',
      'rainbow.me',
      'airstack.xyz',
      'warpcast.com',
      'hey.xyz',
      'supercast.xyz',
      'farscore.xyz',
      'seedclub.com',
      'crowdfund.seedclub.com',
    ];
    
    // Check if URL contains any Mini App patterns
    return miniAppPatterns.some(pattern => urlLower.includes(pattern));
  }

  /**
   * Extract domain from URL
   */
  private extractDomainFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Get fallback domains when API fails
   */
  private getFallbackDomains(): string[] {
    return [
      'app.noice.so',
      'frames.js.org',
      'frame.wtf',
      'gallery.so',
      'paragraph.xyz',
      'nouns.build',
      'degen.tips',
      'mint.fun',
      'zora.co',
      'foundation.app',
      'opensea.io',
      'rainbow.me',
      'airstack.xyz',
      'nounspace.com',
      'warpcast.com',
      'hey.xyz',
      'supercast.xyz',
      'farscore.xyz',
      'seedclub.com',
      'crowdfund.seedclub.com',
    ];
  }

  /**
   * Get domains from developer tools (simulated)
   */
  private async getDomainsFromDeveloperTools(): Promise<string[]> {
    // In a real implementation, you would:
    // 1. Access the developer tool's hosted manifest section
    // 2. Extract domains that developers have registered
    
    return [
      'nouns.build',
      'degen.tips',
      'mint.fun',
      'zora.co',
      'foundation.app',
      'warpcast.com',
      'hey.xyz',
      'supercast.xyz',
      'farscore.xyz',
    ];
  }

  /**
   * Get domains from public registries and Farcaster API
   */
  private async getDomainsFromRegistries(): Promise<string[]> {
    const domains = new Set<string>();
    
    try {
      // 1. From Farcaster Client API (highest priority)
      const farcasterDomains = await this.fetchDomainsFromFarcasterAPI();
      farcasterDomains.forEach(domain => domains.add(domain));
      
      // 2. Query public GitHub repos with Mini App lists
      const githubDomains = await this.fetchDomainsFromGitHub();
      githubDomains.forEach(domain => domains.add(domain));
      
      // 3. Query community-maintained index sites
      const communityDomains = await this.fetchDomainsFromCommunitySites();
      communityDomains.forEach(domain => domains.add(domain));
      
      // 4. Query public APIs that maintain Mini App directories
      const apiDomains = await this.fetchDomainsFromAPIs();
      apiDomains.forEach(domain => domains.add(domain));
      
      console.log(`📚 Found ${domains.size} domains from registries (including Farcaster API)`);
      
    } catch (error) {
      console.warn('⚠️  Failed to fetch from registries, using fallback:', error);
      // Fallback to known domains
      return [
        'opensea.io',
        'rainbow.me',
        'airstack.xyz',
        'seedclub.com',
        'crowdfund.seedclub.com',
        'nounspace.com',
      ];
    }
    
    return Array.from(domains);
  }

  /**
   * Fetch domains from Farcaster Client API and store them directly
   */
  private async fetchDomainsFromFarcasterAPI(): Promise<string[]> {
    const domains: string[] = [];
    
    try {
      console.log('📡 Fetching domains from Farcaster Client API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://client.farcaster.xyz/v1/top-frameapps?limit=100', {
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
      let frameApps: any[] = [];
      
      if (Array.isArray(responseData)) {
        frameApps = responseData;
      } else if (Array.isArray(responseData?.result?.frames)) {
        frameApps = responseData.result.frames;
      } else if (Array.isArray(responseData?.data)) {
        frameApps = responseData.data;
      } else if (Array.isArray(responseData?.apps)) {
        frameApps = responseData.apps;
      } else {
        console.error('Unexpected Farcaster API response structure:', responseData);
        return [];
      }
      
      // Process each frame app and store it directly
      for (const app of frameApps) {
        if (app.domain && this.isValidDomain(app.domain)) {
          domains.push(app.domain);
          
          // Create a Mini App from Farcaster API data
          const miniApp: DiscoveredMiniApp = {
            domain: app.domain,
            manifest: {
              name: app.name,
              iconUrl: app.iconUrl || app.splashImageUrl || '🔗',
              homeUrl: app.homeUrl,
              description: app.description || app.tagline || app.ogDescription || `${app.name} frame app`,
              frame: {
                version: 'vNext',
                name: app.name,
                homeUrl: app.homeUrl,
                iconUrl: app.iconUrl || app.splashImageUrl || '🔗',
                splashImageUrl: app.splashImageUrl,
                splashBackgroundColor: app.splashBackgroundColor
              }
            },
            lastCrawled: new Date(),
            isValid: true,
            engagementScore: Math.max(50 - frameApps.indexOf(app), 0) + (
              app.author?.followerCount 
                ? Math.min(Math.floor(app.author.followerCount / 1000), 50) 
                : 0
            ),
            discoverySource: 'farcaster_api'
          };
          
          // Store the Farcaster API app directly (no need to crawl)
          await this.storeMiniApp(miniApp, undefined, undefined, 'farcaster_api');
        }
      }
      
      console.log(`📡 Found and stored ${domains.length} domains from Farcaster API`);
      
    } catch (error) {
      console.warn('⚠️  Farcaster API fetching failed:', error);
    }
    
    return domains;
  }

  /**
   * Fetch domains from GitHub repositories
   */
  private async fetchDomainsFromGitHub(): Promise<string[]> {
    const domains: string[] = [];
    
    try {
      // Common GitHub repos that maintain Mini App lists
      const repos = [
        'farcasterxyz/miniapps',
        'farcasterxyz/frames',
        'farcasterxyz/awesome-farcaster',
      ];
      
      for (const repo of repos) {
        try {
          // Try to fetch README or specific files
          const response = await fetch(`https://raw.githubusercontent.com/${repo}/main/README.md`);
          if (response.ok) {
            const content = await response.text();
            const urls = content.match(/https?:\/\/[^\s]+/g) || [];
            for (const url of urls) {
              const domain = this.extractDomainFromUrl(url);
              if (domain && this.isValidDomain(domain)) {
                domains.push(domain);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to fetch from ${repo}:`, error);
        }
      }
      
    } catch (error) {
      console.warn('⚠️  GitHub fetching failed:', error);
    }
    
    return domains;
  }

  /**
   * Fetch domains from community sites
   */
  private async fetchDomainsFromCommunitySites(): Promise<string[]> {
    const domains: string[] = [];
    
    try {
      // Community-maintained index sites
      const sites = [
        'https://miniapps.farcaster.xyz',
        'https://frames.js.org',
        'https://frame.wtf',
      ];
      
      for (const site of sites) {
        try {
          const response = await fetch(site);
          if (response.ok) {
            const content = await response.text();
            const urls = content.match(/https?:\/\/[^\s]+/g) || [];
            for (const url of urls) {
              const domain = this.extractDomainFromUrl(url);
              if (domain && this.isValidDomain(domain)) {
                domains.push(domain);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to fetch from ${site}:`, error);
        }
      }
      
    } catch (error) {
      console.warn('⚠️  Community sites fetching failed:', error);
    }
    
    return domains;
  }

  /**
   * Fetch domains from public APIs
   */
  private async fetchDomainsFromAPIs(): Promise<string[]> {
    const domains: string[] = [];
    
    try {
      // Try to fetch from public Mini App directories
      const apis = [
        'https://api.farcaster.xyz/v1/frames',
        'https://client.farcaster.xyz/v1/top-frameapps',
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api);
          if (response.ok) {
            const data = await response.json();
            // Extract domains from API response
            if (data.frames) {
              for (const frame of data.frames) {
                if (frame.url) {
                  const domain = this.extractDomainFromUrl(frame.url);
                  if (domain && this.isValidDomain(domain)) {
                    domains.push(domain);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to fetch from ${api}:`, error);
        }
      }
      
    } catch (error) {
      console.warn('⚠️  API fetching failed:', error);
    }
    
    return domains;
  }

  /**
   * Start the crawling process
   */
  private async startCrawling(): Promise<void> {
    if (this.isCrawling) return;
    
    this.isCrawling = true;
    
    try {
      while (this.crawlQueue.length > 0) {
        const batch = this.crawlQueue.splice(0, this.config.maxConcurrentCrawls);
        await Promise.allSettled(batch.map(domain => this.crawlDomain(domain)));
        
        // Small delay between batches to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Crawl a single domain for Mini App manifest
   */
  private async crawlDomain(domain: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Crawling domain: ${domain}`);
      
      const manifest = await this.fetchManifest(domain);
      const responseTime = Date.now() - startTime;
      
      if (!manifest) {
        this.recordInvalidApp(domain, 'No manifest found');
        
        // Record no manifest found
        await this.recordDomainCrawl(domain, 'not_found', {
          responseTimeMs: responseTime,
          manifestFound: false,
          manifestValid: false
        });
        return;
      }

      const isValid = this.validateManifest(manifest);
      if (!isValid.valid) {
        this.recordInvalidApp(domain, isValid.error || 'Validation failed');
        
        // Record invalid manifest
        await this.recordDomainCrawl(domain, 'invalid', {
          responseTimeMs: responseTime,
          manifestFound: true,
          manifestValid: false,
          errorMessage: isValid.error
        });
        return;
      }

      const discoveredApp: DiscoveredMiniApp = {
        domain,
        manifest,
        lastCrawled: new Date(),
        isValid: true,
        engagementScore: await this.calculateEngagementScore(domain),
      };

      // Store in memory cache
      this.discoveredApps.set(domain, discoveredApp);
      
      // Store in database
      await this.storeMiniApp(discoveredApp);
      
      // Record successful crawl
      await this.recordDomainCrawl(domain, 'success', {
        responseTimeMs: responseTime,
        manifestFound: true,
        manifestValid: true
      });
      
      console.log(`✅ Discovered Mini App: ${domain} - ${manifest.name}`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Error crawling ${domain}:`, error);
      
      this.recordInvalidApp(domain, error instanceof Error ? error.message : 'Unknown error');
      
      // Record error
      await this.recordDomainCrawl(domain, 'error', {
        responseTimeMs: responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Fetch manifest from domain
   */
  private async fetchManifest(domain: string): Promise<MiniAppManifest | null> {
    const manifestUrl = `https://${domain}/.well-known/farcaster.json`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.crawlTimeout);
      
      const response = await fetch(manifestUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NounspaceBot/1.0 (+https://nounspace.com)',
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          // This is expected - domain exists but no Mini App manifest
          console.log(`ℹ️  ${domain} - No Mini App manifest (404)`);
        } else {
          console.warn(`⚠️  ${domain} - HTTP ${response.status}: ${response.statusText}`);
        }
        return null;
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`ℹ️  ${domain} - Non-JSON response (${contentType})`);
        return null;
      }
      
      const manifest = await response.json();
      return manifest;
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOTFOUND')) {
          // Domain doesn't exist - this is also expected
          console.log(`ℹ️  ${domain} - Domain not found`);
        } else if (error.message.includes('Unexpected token')) {
          // Got HTML instead of JSON - probably a redirect or error page
          console.log(`ℹ️  ${domain} - Non-JSON response (likely redirect)`);
        } else {
          console.warn(`⚠️  ${domain} - Network error: ${error.message}`);
        }
      } else {
        console.warn(`⚠️  ${domain} - Unknown error:`, error);
      }
      return null;
    }
  }

  /**
   * Validate manifest structure and content
   */
  private validateManifest(manifest: any): { valid: boolean; error?: string } {
    // Handle different manifest structures
    let manifestData = manifest;
    
    // Check if manifest has frame property (newer format)
    if (manifest.frame && typeof manifest.frame === 'object') {
      manifestData = manifest.frame;
    }
    
    // Check required fields
    if (!manifestData.name || typeof manifestData.name !== 'string') {
      return { valid: false, error: 'Missing or invalid name field' };
    }
    
    if (!manifestData.iconUrl || typeof manifestData.iconUrl !== 'string') {
      return { valid: false, error: 'Missing or invalid iconUrl field' };
    }
    
    if (!manifestData.homeUrl || typeof manifestData.homeUrl !== 'string') {
      return { valid: false, error: 'Missing or invalid homeUrl field' };
    }

    // Validate URLs
    try {
      new URL(manifestData.iconUrl);
      new URL(manifestData.homeUrl);
    } catch {
      return { valid: false, error: 'Invalid URLs in manifest' };
    }

    return { valid: true };
  }

  /**
   * Validate image URL returns valid image content
   */
  private async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'NounspaceBot/1.0 (+https://nounspace.com)',
        },
      });
      
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : false;
      
    } catch {
      return false;
    }
  }

  /**
   * Calculate engagement score for a domain
   */
  private async calculateEngagementScore(domain: string): Promise<number> {
    // In a real implementation, you would:
    // 1. Query usage analytics
    // 2. Check recent activity
    // 3. Count unique users
    // 4. Check trending activity
    
    // For now, return a random score for demonstration
    return Math.floor(Math.random() * 100);
  }

  /**
   * Check if domain is valid for crawling
   */
  private isValidDomain(domain: string): boolean {
    // Exclude development tunnels and invalid domains
    if (this.config.excludePatterns.some(pattern => pattern.test(domain))) {
      return false;
    }
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  /**
   * Record invalid app discovery
   */
  private recordInvalidApp(domain: string, error: string): void {
    const invalidApp: DiscoveredMiniApp = {
      domain,
      manifest: {} as MiniAppManifest,
      lastCrawled: new Date(),
      isValid: false,
      error,
    };
    
    this.discoveredApps.set(domain, invalidApp);
  }

  /**
   * Get all valid discovered Mini Apps
   */
  async getValidMiniApps(): Promise<DiscoveredMiniApp[]> {
    // Load from database if we haven't already
    if (this.discoveredApps.size === 0) {
      await this.loadFromDatabase();
    }
    
    return Array.from(this.discoveredApps.values())
      .filter(app => app.isValid)
      .filter(app => (app.engagementScore || 0) >= this.config.engagementThreshold);
  }

  /**
   * Convert discovered apps to FidgetOptions format
   */
  async toFidgetOptions(): Promise<MiniAppFidgetOption[]> {
    const validApps = await this.getValidMiniApps();
    return validApps.map((app, index) => {
      const manifest = app.manifest;
      
      // Determine category based on discovery source and app data
      let category = 'mini-apps';
      const tags = ['mini-apps', 'discovered', manifest.name.toLowerCase().replace(/\s+/g, '-')];
      
      // Add source-specific tags
      if (app.discoverySource === 'farcaster_api') {
        tags.push('farcaster', 'official');
      } else if (app.discoverySource === 'cast_crawling') {
        tags.push('community', 'organic');
      } else if (app.discoverySource === 'registry') {
        tags.push('curated', 'registry');
      }
      
      return {
        id: `discovered-miniapp-${app.domain}-${index}`,
        type: 'miniapp' as const,
        name: manifest.name,
        description: manifest.description || `${manifest.name} Mini App`,
        icon: manifest.iconUrl || '🔗',
        tags,
        category,
        frameUrl: manifest.homeUrl,
        homeUrl: manifest.homeUrl,
        domain: app.domain,
        buttonTitle: 'Open',
        imageUrl: manifest.iconUrl,
        splashImageUrl: manifest.frame?.splashImageUrl,
        splashBackgroundColor: manifest.frame?.splashBackgroundColor,
        popularity: app.engagementScore || 50,
      };
    });
  }

  /**
   * Schedule re-indexing
   */
  scheduleReindexing(): void {
    // Schedule daily re-indexing
    setInterval(() => {
      this.reindexAll();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Re-index all discovered apps
   */
  private async reindexAll(): Promise<void> {
    console.log('🔄 Starting scheduled re-indexing...');
    const domains = Array.from(this.discoveredApps.keys());
    await this.addDomainsToQueue(domains);
  }

  /**
   * Get discovery statistics
   */
  getStats(): {
    totalDiscovered: number;
    validApps: number;
    invalidApps: number;
    queueLength: number;
    isCrawling: boolean;
    lastDiscoveryRun?: Date;
    sourceStats?: {
      casts: { success: boolean; domainsFound: number };
      registries: { success: boolean; domainsFound: number };
      developerTools: { success: boolean; domainsFound: number };
    };
  } {
    const apps = Array.from(this.discoveredApps.values());
    
    return {
      totalDiscovered: apps.length,
      validApps: apps.filter(app => app.isValid).length,
      invalidApps: apps.filter(app => !app.isValid).length,
      queueLength: this.crawlQueue.length,
      isCrawling: this.isCrawling,
      lastDiscoveryRun: this.lastDiscoveryRun,
      sourceStats: this.sourceStats,
    };
  }

  /**
   * Clear cache and force re-discovery
   */
  clearCache(): void {
    this.discoveredApps.clear();
    this.crawlQueue = [];
  }

  /**
   * Test a specific domain manually (for debugging)
   */
  async testDomain(domain: string): Promise<{
    success: boolean;
    manifest?: MiniAppManifest;
    error?: string;
    details?: any;
  }> {
    try {
      console.log(`🧪 Testing domain: ${domain}`);
      
      if (!this.isValidDomain(domain)) {
        return {
          success: false,
          error: 'Invalid domain (excluded by patterns)'
        };
      }

      const manifest = await this.fetchManifest(domain);
      if (!manifest) {
        return {
          success: false,
          error: 'No manifest found or fetch failed'
        };
      }

      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Validation failed',
          details: { manifest }
        };
      }

      return {
        success: true,
        manifest,
        details: {
          domain,
          isValid: true,
          validation: validation
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
  }
} 
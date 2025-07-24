import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.d.ts';

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
  discoverySource?: 'farcaster_api' | 'manual';
}

export interface DiscoveryConfig {
  maxConcurrentCrawls: number;
  crawlTimeout: number;
  retryAttempts: number;
  engagementThreshold: number;
}

export class MiniAppDiscoveryService {
  private static instance: MiniAppDiscoveryService;
  private discoveredApps: Map<string, DiscoveredMiniApp> = new Map();
  private isCrawling = false;
  private config: DiscoveryConfig;
  private supabase: ReturnType<typeof createClient<Database>>;

  private constructor(config: Partial<DiscoveryConfig> = {}) {
    this.config = {
      maxConcurrentCrawls: 5,
      crawlTimeout: 10000,
      retryAttempts: 3,
      engagementThreshold: 10,
      ...config
    };

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
   * Start discovery process
   */
  async discover(): Promise<void> {
    if (this.isCrawling) {
      console.log('🔄 Discovery already in progress');
      return;
    }

    this.isCrawling = true;
    console.log('🚀 Starting Mini App discovery...');

    try {
      // Load existing apps from database
      await this.loadFromDatabase();

      // Fetch from Farcaster API
      await this.fetchFromFarcasterAPI();

      // Process discovered apps
      await this.processDiscoveredApps();

      console.log('✅ Discovery completed');
    } catch (error) {
      console.error('❌ Discovery failed:', error);
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Fetch Mini Apps from Farcaster API
   */
  private async fetchFromFarcasterAPI(): Promise<void> {
    try {
      console.log('📡 Fetching from Farcaster API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.crawlTimeout);
      
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
      
      const data = await response.json();
      const frameApps = data.frameApps || data.apps || [];
      
      console.log(`📱 Found ${frameApps.length} apps from Farcaster API`);
      
      // Process each app
      for (const app of frameApps) {
        if (app.domain && this.isValidDomain(app.domain)) {
          const miniApp: DiscoveredMiniApp = {
            domain: app.domain,
            manifest: {
              name: app.name || app.title || 'Unknown App',
              iconUrl: app.iconUrl || app.imageUrl || '',
              homeUrl: app.homeUrl || app.url || `https://${app.domain}`,
              description: app.description || app.subtitle || undefined
            },
            lastCrawled: new Date(),
            isValid: true,
            engagementScore: this.calculateEngagementScore(app),
            discoverySource: 'farcaster_api'
          };
          
          this.discoveredApps.set(app.domain, miniApp);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch from Farcaster API:', error);
    }
  }

  /**
   * Process and store discovered apps
   */
  private async processDiscoveredApps(): Promise<void> {
    console.log(`🔄 Processing ${this.discoveredApps.size} discovered apps...`);
    
    for (const [domain, app] of this.discoveredApps) {
      try {
        // Validate manifest if not from Farcaster API
        if (app.discoverySource !== 'farcaster_api') {
          const manifest = await this.fetchManifest(domain);
          if (manifest) {
            app.manifest = manifest;
            app.isValid = true;
          } else {
            app.isValid = false;
            app.error = 'Manifest not found or invalid';
          }
        }

        // Store in database
        await this.storeMiniApp(app);
        
        if (app.isValid) {
          console.log(`✅ Processed: ${domain}`);
        } else {
          console.log(`❌ Invalid: ${domain} - ${app.error}`);
        }
      } catch (error) {
        console.error(`❌ Failed to process ${domain}:`, error);
        app.isValid = false;
        app.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  /**
   * Fetch manifest from domain
   */
  private async fetchManifest(domain: string): Promise<MiniAppManifest | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.crawlTimeout);
      
      const response = await fetch(`https://${domain}/.well-known/farcaster.json`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return null;
      }
      
      const manifest = await response.json();
      return this.validateManifest(manifest) ? manifest : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate manifest structure
   */
  private validateManifest(manifest: any): boolean {
    return !!(manifest && 
      manifest.name && 
      manifest.iconUrl && 
      manifest.homeUrl &&
      typeof manifest.name === 'string' &&
      typeof manifest.iconUrl === 'string' &&
      typeof manifest.homeUrl === 'string'
    );
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(app: any): number {
    // Simple scoring based on available data
    let score = 50; // Base score
    
    if (app.usageCount) score += Math.min(app.usageCount * 2, 40);
    if (app.isVerified) score += 10;
    if (app.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 30) score += 10; // New apps get boost
    }
    
    return Math.min(score, 100);
  }

  /**
   * Store Mini App in database
   */
  private async storeMiniApp(app: DiscoveredMiniApp): Promise<void> {
    try {
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
        discovery_source: app.discoverySource || 'manual',
        validation_errors: app.error ? [app.error] : null,
        usage_count: 0,
        last_used_at: null
      };

      const { error } = await this.supabase
        .from('discovered_mini_apps')
        .upsert(appData, { onConflict: 'domain' });

      if (error) {
        console.error(`❌ Failed to store ${app.domain}:`, error);
      }
    } catch (error) {
      console.error(`❌ Failed to store ${app.domain}:`, error);
    }
  }

  /**
   * Load apps from database
   */
  private async loadFromDatabase(): Promise<void> {
    try {
      const { data: apps, error } = await this.supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('is_valid', true)
        .order('engagement_score', { ascending: false });

      if (error) {
        console.error('❌ Failed to load from database:', error);
        return;
      }

      for (const app of apps || []) {
        this.discoveredApps.set(app.domain, {
          domain: app.domain,
          manifest: app.manifest_data as unknown as MiniAppManifest,
          lastCrawled: new Date(app.last_validated_at || new Date()),
          isValid: app.is_valid || false,
          engagementScore: app.engagement_score || 0,
          discoverySource: app.discovery_source as 'farcaster_api' | 'manual'
        });
      }

      console.log(`📚 Loaded ${this.discoveredApps.size} apps from database`);
    } catch (error) {
      console.error('❌ Failed to load from database:', error);
    }
  }

  /**
   * Get valid Mini Apps
   */
  async getValidMiniApps(): Promise<DiscoveredMiniApp[]> {
    return Array.from(this.discoveredApps.values())
      .filter(app => app.isValid)
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
  }

  /**
   * Convert to fidget options
   */
  async toFidgetOptions(): Promise<any[]> {
    const validApps = await this.getValidMiniApps();
    
    return validApps.map((app, index) => {
      const manifest = app.manifest;
      const tags = ['mini-apps', 'discovered', manifest.name.toLowerCase().replace(/\s+/g, '-')];
      
      if (app.discoverySource === 'farcaster_api') {
        tags.push('farcaster', 'official');
      }
      
      return {
        id: `discovered-miniapp-${app.domain}-${index}`,
        type: 'miniapp' as const,
        name: manifest.name,
        description: manifest.description || `${manifest.name} Mini App`,
        icon: manifest.iconUrl || '🔗',
        tags,
        category: 'mini-apps',
        frameUrl: manifest.homeUrl,
        homeUrl: manifest.homeUrl,
        domain: app.domain,
        buttonTitle: 'Open',
        imageUrl: manifest.iconUrl,
        popularity: app.engagementScore || 50,
      };
    });
  }

  /**
   * Get discovery statistics
   */
  getStats(): {
    totalDiscovered: number;
    validApps: number;
    isCrawling: boolean;
  } {
    const apps = Array.from(this.discoveredApps.values());
    
    return {
      totalDiscovered: apps.length,
      validApps: apps.filter(app => app.isValid).length,
      isCrawling: this.isCrawling,
    };
  }

  /**
   * Check if domain is valid
   */
  private isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain) &&
           !domain.includes('localhost') &&
           !domain.includes('127.0.0.1') &&
           !domain.includes('ngrok.io') &&
           !domain.includes('replit.dev');
  }
} 
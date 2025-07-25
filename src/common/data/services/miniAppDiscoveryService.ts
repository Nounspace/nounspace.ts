import { createSupabaseServerClient } from '@/common/data/database/supabase/clients/server';

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
  discoverySource?: 'farcaster_api' | 'manual' | 'farcaster_api_crawled' | 'cast_crawling';
}

export class MiniAppDiscoveryService {
  private static instance: MiniAppDiscoveryService;
  private discoveredApps: Map<string, DiscoveredMiniApp> = new Map();
  private isCrawling = false;
  private supabase: ReturnType<typeof createSupabaseServerClient>;

  private constructor() {
    this.supabase = createSupabaseServerClient();
  }

  static getInstance(): MiniAppDiscoveryService {
    if (!MiniAppDiscoveryService.instance) {
      MiniAppDiscoveryService.instance = new MiniAppDiscoveryService();
    }
    return MiniAppDiscoveryService.instance;
  }

  /**
   * Loads valid mini apps from the database
   */
  async discover(): Promise<void> {
    if (this.isCrawling) {
      console.log('🔄 Discovery already in progress');
      return;
    }
    this.isCrawling = true;
    try {
      await this.loadFromDatabase();
      console.log('✅ Discovery completed (database only)');
    } catch (error) {
      console.error('❌ Discovery failed:', error);
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Loads valid mini apps from the database
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
          discoverySource: app.discovery_source as 'farcaster_api' | 'manual',
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
}
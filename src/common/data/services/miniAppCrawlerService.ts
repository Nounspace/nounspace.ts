import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database';

export interface CrawlResult {
  domain: string;
  manifest: MiniAppManifest | null;
  isValid: boolean;
  error?: string;
  responseTime: number;
  httpStatus?: number;
}

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

export interface CrawlerConfig {
  maxConcurrentCrawls: number;
  crawlTimeout: number;
  retryAttempts: number;
  userAgent: string;
}

export class MiniAppCrawlerService {
  private static instance: MiniAppCrawlerService;
  private supabase: ReturnType<typeof createClient<Database>>;
  private config: CrawlerConfig;
  private isCrawling = false;

  private constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      maxConcurrentCrawls: 5,
      crawlTimeout: 10000,
      retryAttempts: 3,
      userAgent: 'Nounspace-MiniApp-Crawler/1.0',
      ...config
    };

    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  static getInstance(config?: Partial<CrawlerConfig>): MiniAppCrawlerService {
    if (!MiniAppCrawlerService.instance) {
      MiniAppCrawlerService.instance = new MiniAppCrawlerService(config);
    }
    return MiniAppCrawlerService.instance;
  }

  /**
   * Crawl a list of domains for Mini App manifests
   */
  async crawlDomains(domains: string[]): Promise<CrawlResult[]> {
    if (this.isCrawling) {
      console.log('🔄 Crawling already in progress');
      return [];
    }

    this.isCrawling = true;
    console.log(`🚀 Starting crawl of ${domains.length} domains...`);

    try {
      const results: CrawlResult[] = [];
      const validDomains = domains.filter(domain => this.isValidDomain(domain));
      
      console.log(`📋 Valid domains to crawl: ${validDomains.length}`);

      // Process domains in batches to respect concurrency limits
      for (let i = 0; i < validDomains.length; i += this.config.maxConcurrentCrawls) {
        const batch = validDomains.slice(i, i + this.config.maxConcurrentCrawls);
        const batchPromises = batch.map(domain => this.crawlDomain(domain));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error('❌ Crawl failed:', result.reason);
          }
        }

        // Small delay between batches to be respectful
        if (i + this.config.maxConcurrentCrawls < validDomains.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Record crawl history
      await this.recordCrawlHistory(results);

      console.log(`✅ Crawl completed: ${results.length} domains processed`);
      return results;

    } catch (error) {
      console.error('❌ Crawl failed:', error);
      return [];
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Crawl a single domain for its Mini App manifest
   */
  private async crawlDomain(domain: string): Promise<CrawlResult> {
    const startTime = Date.now();
    const manifestUrl = `https://${domain}/.well-known/farcaster.json`;

    try {
      console.log(`🔍 Crawling: ${domain}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.crawlTimeout);

      const response = await fetch(manifestUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.config.userAgent,
        }
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          domain,
          manifest: null,
          isValid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
          httpStatus: response.status
        };
      }

      const manifestData = await response.json();
      const isValid = this.validateManifest(manifestData);

      return {
        domain,
        manifest: isValid ? manifestData : null,
        isValid,
        error: isValid ? undefined : 'Invalid manifest structure',
        responseTime,
        httpStatus: response.status
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        domain,
        manifest: null,
        isValid: false,
        error: errorMessage,
        responseTime,
        httpStatus: undefined
      };
    }
  }

  /**
   * Extract domains from Farcaster casts
   */
  async extractDomainsFromCasts(casts: any[]): Promise<string[]> {
    const domains = new Set<string>();

    for (const cast of casts) {
      try {
        // Extract domains from cast text
        const textDomains = this.extractDomainsFromText(cast.text || '');
        textDomains.forEach(domain => domains.add(domain));

        // Extract domains from embeds
        if (cast.embeds) {
          for (const embed of cast.embeds) {
            if (embed.url) {
              const domain = this.extractDomainFromUrl(embed.url);
              if (domain) domains.add(domain);
            }
          }
        }

        // Extract domains from frames
        if (cast.frames) {
          for (const frame of cast.frames) {
            if (frame.url) {
              const domain = this.extractDomainFromUrl(frame.url);
              if (domain) domains.add(domain);
            }
          }
        }

      } catch (error) {
        console.error('❌ Failed to extract domains from cast:', error);
      }
    }

    return Array.from(domains).filter(domain => this.isValidDomain(domain));
  }

  /**
   * Extract domains from text using regex
   */
  private extractDomainsFromText(text: string): string[] {
    const domainRegex = new RegExp(
      '(?:https?://)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
      '\\.(?:[a-zA-Z]{2,}(?:\\.[a-zA-Z]{2,})*))',
      'g'
    );
    const matches = text.match(domainRegex);
    
    if (!matches) return [];

    return matches
      .map(match => match.replace(/^https?:\/\//, ''))
      .filter(domain => this.isValidDomain(domain));
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
   * Validate domain format and exclude development domains
   */
  private isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*)$/.test(domain) &&
           !domain.includes('localhost') &&
           !domain.includes('127.0.0.1') &&
           !domain.includes('ngrok.io') &&
           !domain.includes('replit.dev') &&
           !domain.includes('vercel.app') &&
           !domain.includes('netlify.app') &&
           domain.length > 0;
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
   * Record crawl history in database
   */
  private async recordCrawlHistory(results: CrawlResult[]): Promise<void> {
    try {
      const crawlRecords = results.map(result => ({
        domain: result.domain,
        status: result.isValid ? 'success' : 'failed',
        manifest_found: result.manifest !== null,
        manifest_valid: result.isValid,
        http_status: result.httpStatus,
        response_time_ms: result.responseTime,
        error_message: result.error || null,
        crawled_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('domain_crawl_history')
        .insert(crawlRecords);

      if (error) {
        console.error('❌ Failed to record crawl history:', error);
      } else {
        console.log(`📊 Recorded crawl history for ${crawlRecords.length} domains`);
      }

    } catch (error) {
      console.error('❌ Failed to record crawl history:', error);
    }
  }

  /**
   * Get crawl statistics
   */
  async getCrawlStats(): Promise<{
    totalCrawled: number;
    successfulCrawls: number;
    failedCrawls: number;
    averageResponseTime: number;
    isCrawling: boolean;
  }> {
    try {
      const { data: history, error } = await this.supabase
        .from('domain_crawl_history')
        .select('*')
        .order('crawled_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('❌ Failed to get crawl stats:', error);
        return {
          totalCrawled: 0,
          successfulCrawls: 0,
          failedCrawls: 0,
          averageResponseTime: 0,
          isCrawling: this.isCrawling
        };
      }

      const totalCrawled = history?.length || 0;
      const successfulCrawls = history?.filter(h => h.status === 'success').length || 0;
      const failedCrawls = totalCrawled - successfulCrawls;
      const averageResponseTime = history?.length 
        ? history.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / history.length 
        : 0;

      return {
        totalCrawled,
        successfulCrawls,
        failedCrawls,
        averageResponseTime: Math.round(averageResponseTime),
        isCrawling: this.isCrawling
      };

    } catch (error) {
      console.error('❌ Failed to get crawl stats:', error);
      return {
        totalCrawled: 0,
        successfulCrawls: 0,
        failedCrawls: 0,
        averageResponseTime: 0,
        isCrawling: this.isCrawling
      };
    }
  }

  /**
   * Check if currently crawling
   */
  get isCurrentlyCrawling(): boolean {
    return this.isCrawling;
  }

  /**
   * High-volume crawl using multiple FIDs and feed types
   * This method can process 50k+ casts efficiently
   */
  async massiveCrawlFromFarcaster(options: {
    targetCasts?: number;
    fids?: number[];
    feedTypes?: string[];
    maxPagesPerFid?: number;
    limitPerRequest?: number;
  } = {}): Promise<{
    totalCasts: number;
    uniqueCasts: number;
    domainsFound: number;
    crawlResults: CrawlResult[];
    processingTime: number;
  }> {
    const {
      targetCasts = 50000,
      fids = [3, 2, 194, 1, 5, 6, 7, 8, 9, 10],
      feedTypes = ['for_you', 'following'],
      maxPagesPerFid = 1000,
      limitPerRequest = 50
    } = options;

    if (this.isCrawling) {
      console.log('🔄 Massive crawl already in progress');
      return {
        totalCasts: 0,
        uniqueCasts: 0,
        domainsFound: 0,
        crawlResults: [],
        processingTime: 0
      };
    }

    this.isCrawling = true;
    const startTime = Date.now();
    
    console.log(`🚀 Starting MASSIVE crawl targeting ${targetCasts} casts...`);
    console.log(`📊 Using ${fids.length} FIDs: ${fids.join(', ')}`);
    console.log(`📋 Feed types: ${feedTypes.join(', ')}`);

    try {
      const allCasts: any[] = [];
      const castIds = new Set<string>(); // For deduplication

      // Collect casts from all FIDs and feed types
      for (const fid of fids) {
        for (const feedType of feedTypes) {
          console.log(`📝 Fetching ${feedType} feed for FID ${fid}...`);
          
          let cursor: string | null = null;
          let pageCount = 0;
          let fidCasts = 0;

          while (pageCount < maxPagesPerFid && allCasts.length < targetCasts) {
            const url = cursor 
              ? `http://localhost:3000/api/farcaster/neynar/feed?feedType=${feedType}&fid=${fid}&limit=${limitPerRequest}&cursor=${cursor}`
              : `http://localhost:3000/api/farcaster/neynar/feed?feedType=${feedType}&fid=${fid}&limit=${limitPerRequest}`;

            try {
              const response = await fetch(url);
              const feedData = await response.json();

              if (!feedData.casts || feedData.casts.length === 0) {
                console.log(`📄 FID ${fid} ${feedType}: No more casts found`);
                break;
              }

              // Add unique casts only
              for (const cast of feedData.casts) {
                if (cast.hash && !castIds.has(cast.hash)) {
                  castIds.add(cast.hash);
                  allCasts.push(cast);
                }
              }

              fidCasts += feedData.casts.length;
              pageCount++;

              // Show progress every 10 pages
              if (pageCount % 10 === 0 || pageCount === 1) {
                console.log(`📄 FID ${fid} ${feedType} Page ${pageCount}: ${feedData.casts.length} casts (Total: ${allCasts.length})`);
              }

              // Get cursor for next page
              cursor = feedData.next?.cursor;
              if (!cursor) {
                console.log(`📄 FID ${fid} ${feedType}: No more pages available`);
                break;
              }

              // Small delay between requests
              await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
              console.error(`❌ Error fetching FID ${fid} ${feedType} page ${pageCount}:`, error);
              break;
            }
          }

          console.log(`✅ FID ${fid} ${feedType}: Collected ${fidCasts} casts`);
        }
      }

      console.log(`📊 Total casts collected: ${allCasts.length}`);
      console.log(`🆔 Unique casts: ${castIds.size}`);

      // Extract domains from all casts
      console.log('🔍 Extracting domains from casts...');
      const domains = await this.extractDomainsFromCasts(allCasts);
      console.log(`📋 Found ${domains.length} unique domains`);

      // Crawl the domains
      console.log('🚀 Starting domain crawling...');
      const crawlResults = await this.crawlDomains(domains);

      const processingTime = Date.now() - startTime;

      console.log(`✅ MASSIVE crawl completed in ${processingTime}ms`);
      console.log(`📊 Results: ${crawlResults.length} domains crawled, ${crawlResults.filter(r => r.isValid).length} valid`);

      return {
        totalCasts: allCasts.length,
        uniqueCasts: castIds.size,
        domainsFound: domains.length,
        crawlResults,
        processingTime
      };

    } catch (error) {
      console.error('❌ Massive crawl failed:', error);
      return {
        totalCasts: 0,
        uniqueCasts: 0,
        domainsFound: 0,
        crawlResults: [],
        processingTime: Date.now() - startTime
      };
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Fetch and crawl the Farcaster top frame apps list
   * - Fetches from the Farcaster API
   * - Crawls each valid domain for a manifest
   * - Returns crawl results (does not store in DB)
   */
  async crawlFarcasterTopFrameApps(): Promise<CrawlResult[]> {
    const apiUrl = 'https://client.farcaster.xyz/v1/top-frameapps?limit=100';
    try {
      const response = await fetch(apiUrl, { 
        headers: { 'Accept': 'application/json' } 
      });
      if (!response.ok) {
        console.error(
          `❌ Failed to fetch Farcaster top frame apps: HTTP ${response.status}`
        );
        return [];
      }
      const data = await response.json();
      const frameApps = data.result?.frames || data.frameApps || data.apps || [];
      const domains: string[] = [];
      for (const app of frameApps) {
        if (app.domain && this.isValidDomain(app.domain)) {
          domains.push(app.domain);
        }
      }
      if (domains.length === 0) {
        console.log('No valid domains found in Farcaster top frame apps list.');
        return [];
      }
      console.log(
        `Crawling ${domains.length} domains from Farcaster top frame apps list...`
      );
      return await this.crawlDomains(domains);
    } catch (error) {
      console.error('❌ Error fetching/crawling Farcaster top frame apps:', error);
      return [];
    }
  }
} 
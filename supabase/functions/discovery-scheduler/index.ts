import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CrawlResult {
  domain: string;
  manifest: any;
  isValid: boolean;
  error?: string;
  responseTime: number;
  httpStatus?: number;
}

interface MiniAppManifest {
  name: string;
  iconUrl: string;
  homeUrl: string;
  description?: string;
}

interface DiscoveredMiniApp {
  domain: string;
  manifest: MiniAppManifest;
  lastCrawled: Date;
  isValid: boolean;
  error?: string;
  engagementScore?: number;
  discoverySource?: 'farcaster_api' | 'manual' | 'farcaster_api_crawled' | 'cast_crawling';
}

class MiniAppCrawlerService {
  private supabase: any;
  private isCrawling = false;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * High-volume crawl using multiple FIDs and feed types
   * This method can process 50k+ casts efficiently
   * Uses OpenRank to dynamically select top-ranked users
   */
  async massiveCrawlFromFarcaster(options: {
    targetCasts?: number;
    fids?: number[];
    feedTypes?: string[];
    maxPagesPerFid?: number;
    limitPerRequest?: number;
    useOpenRank?: boolean;
  } = {}): Promise<{
    totalCasts: number;
    uniqueCasts: number;
    domainsFound: number;
    crawlResults: CrawlResult[];
    processingTime: number;
  }> {
    const {
      targetCasts = 50000,
      fids = [],
      feedTypes = ['for_you', 'following'],
      maxPagesPerFid = 1000,
      limitPerRequest = 50,
      useOpenRank = true
    } = options;

    // Get top FIDs from OpenRank if enabled
    let topFids = fids;
    if (useOpenRank && fids.length === 0) {
      console.log('🏆 Fetching top FIDs from OpenRank...');
      topFids = await this.getTopFidsFromOpenRank(15); // Get top 15 users
      console.log(`📊 Using top ${topFids.length} FIDs from OpenRank: ${topFids.join(', ')}`);
    }

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
              ? `https://api.neynar.com/v2/farcaster/feed?feed_type=${feedType}&fid=${fid}&limit=${limitPerRequest}&cursor=${cursor}`
              : `https://api.neynar.com/v2/farcaster/feed?feed_type=${feedType}&fid=${fid}&limit=${limitPerRequest}`;

            try {
              const response = await fetch(url, {
                headers: {
                  'api_key': Deno.env.get('NEYNAR_API_KEY') || '',
                  'Accept': 'application/json'
                }
              });

              if (!response.ok) {
                console.error(`❌ Neynar API error: ${response.status} ${response.statusText}`);
                break;
              }

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
   * Get top FIDs from OpenRank Global Profile Ranking
   * Uses engagement-based ranking for better Mini App discovery
   */
  private async getTopFidsFromOpenRank(limit: number = 15): Promise<number[]> {
    try {
      console.log(`🏆 Fetching top ${limit} FIDs from OpenRank...`);
      
      // Use OpenRank Global Profile Ranking API (engagement-based)
      const response = await fetch(`https://api.openrank.com/v1/farcaster/global/profile/engagement?limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('OPENRANK_API_KEY') || ''}`
        }
      });

      if (!response.ok) {
        console.error(`❌ OpenRank API error: ${response.status} ${response.statusText}`);
        // Fallback to default FIDs if OpenRank fails
        return [3, 2, 194, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      }

      const data = await response.json();
      const fids = data.profiles?.map((profile: any) => profile.fid) || [];
      
      console.log(`✅ Retrieved ${fids.length} FIDs from OpenRank`);
      return fids;

    } catch (error) {
      console.error('❌ Failed to fetch from OpenRank:', error);
      // Fallback to default FIDs
      return [3, 2, 194, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    }
  }

  /**
   * Extract domains from text using regex
   */
  private extractDomainsFromText(text: string): string[] {
    const domainRegex = /(?:https?:\/\/)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*))/g;
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
      const maxConcurrentCrawls = 5;
      for (let i = 0; i < validDomains.length; i += maxConcurrentCrawls) {
        const batch = validDomains.slice(i, i + maxConcurrentCrawls);
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
        if (i + maxConcurrentCrawls < validDomains.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

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
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(manifestUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nounspace-MiniApp-Crawler/1.0',
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
   * Store Mini App in database
   */
  async storeMiniApp(app: DiscoveredMiniApp): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mini_apps')
        .upsert({
          domain: app.domain,
          name: app.manifest.name,
          description: app.manifest.description || null,
          icon_url: app.manifest.iconUrl,
          home_url: app.manifest.homeUrl,
          is_valid: app.isValid,
          error_message: app.error || null,
          engagement_score: app.engagementScore || 0,
          discovery_source: app.discoverySource || 'cast_crawling',
          last_crawled: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'domain'
        });

      if (error) {
        console.error(`❌ Failed to store Mini App ${app.domain}:`, error);
      } else {
        console.log(`✅ Stored Mini App: ${app.domain}`);
      }

    } catch (error) {
      console.error(`❌ Failed to store Mini App ${app.domain}:`, error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create crawler service
    const crawlerService = new MiniAppCrawlerService(supabase);

    console.log('🚀 Starting scheduled Mini App discovery job...');

    // Crawl Farcaster top frame apps first
    console.log('🌐 Crawling Farcaster top frame apps...');
    const topFrameAppResults = await (async () => {
      try {
        const apiUrl = 'https://client.farcaster.xyz/v1/top-frameapps?limit=100';
        const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
          console.error(`❌ Failed to fetch Farcaster top frame apps: HTTP ${response.status}`);
          return [];
        }
        const data = await response.json();
        const frameApps = data.result?.frames || data.frameApps || data.apps || [];
        const domains = [];
        for (const app of frameApps) {
          if (app.domain && crawlerService.isValidDomain(app.domain)) {
            domains.push(app.domain);
          }
        }
        if (domains.length === 0) {
          console.log('No valid domains found in Farcaster top frame apps list.');
          return [];
        }
        console.log(`Crawling ${domains.length} domains from Farcaster top frame apps list...`);
        return await crawlerService.crawlDomains(domains);
      } catch (error) {
        console.error('❌ Error fetching/crawling Farcaster top frame apps:', error);
        return [];
      }
    })();
    // Store valid Mini Apps from top frame apps
    let validTopFrameApps = 0;
    for (const crawlResult of topFrameAppResults) {
      if (crawlResult.isValid && crawlResult.manifest) {
        const miniApp = {
          domain: crawlResult.domain,
          manifest: crawlResult.manifest,
          lastCrawled: new Date(),
          isValid: true,
          discoverySource: 'farcaster_api'
        };
        await crawlerService.storeMiniApp(miniApp);
        validTopFrameApps++;
      }
    }
    console.log(`✅ Stored ${validTopFrameApps} valid Mini Apps from Farcaster top frame apps list.`);

    // Run the massive crawl with OpenRank-based FID selection
    const result = await crawlerService.massiveCrawlFromFarcaster({
      targetCasts: 50000,
      fids: [], // Empty array triggers OpenRank lookup
      feedTypes: ['for_you', 'following'],
      maxPagesPerFid: 1000,
      limitPerRequest: 50,
      useOpenRank: true // Enable OpenRank-based FID selection
    });

    // Store valid Mini Apps in database
    console.log('💾 Storing Mini Apps in database...');
    for (const crawlResult of result.crawlResults) {
      if (crawlResult.isValid && crawlResult.manifest) {
        const miniApp: DiscoveredMiniApp = {
          domain: crawlResult.domain,
          manifest: crawlResult.manifest,
          lastCrawled: new Date(),
          isValid: true,
          discoverySource: 'cast_crawling'
        };
        await crawlerService.storeMiniApp(miniApp);
      }
    }

    console.log('✅ Scheduled discovery job completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled discovery job completed',
        result: {
          totalCasts: result.totalCasts,
          uniqueCasts: result.uniqueCasts,
          domainsFound: result.domainsFound,
          validApps: result.crawlResults.filter(r => r.isValid).length,
          processingTime: result.processingTime
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Scheduled discovery job failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 
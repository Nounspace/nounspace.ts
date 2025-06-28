// Common domains that are definitely NOT Frame v2 compatible
const NON_FRAME_DOMAINS = [
  // Social Media
  'x.com',
  'twitter.com', 
  'instagram.com',
  'facebook.com',
  'linkedin.com',
  'tiktok.com',
  'snapchat.com',
  'discord.com',
  'telegram.org',
  'whatsapp.com',
  
  // Video Platforms
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'twitch.tv',
  'dailymotion.com',
  'netflix.com',
  'hulu.com',
  'primevideo.com',
  
  // Image/Media Hosting
  'imgur.com',
  'giphy.com',
  'tenor.com',
  'media.tenor.com',
  'pinterest.com',
  'flickr.com',
  'unsplash.com',
  
  // News/Content Sites
  'cnn.com',
  'bbc.com',
  'nytimes.com',
  'washingtonpost.com',
  'reuters.com',
  'bloomberg.com',
  'techcrunch.com',
  'verge.com',
  'ycombinator.com',
  'reddit.com',
  
  // E-commerce
  'amazon.com',
  'ebay.com',
  'shopify.com',
  'etsy.com',
  'alibaba.com',
  
  // Developer/Tech
  'github.com',
  'gitlab.com',
  'stackoverflow.com',
  'npmjs.com',
  'pypi.org',
  
  // Documentation/Reference
  'wikipedia.org',
  'mdn.mozilla.org',
  'docs.google.com',
  'notion.so',
  'confluence.atlassian.com',
  
  // Google Services
  'google.com',
  'gmail.com',
  'drive.google.com',
  'maps.google.com',
  
  // Microsoft Services
  'microsoft.com',
  'office.com',
  'outlook.com',
  'teams.microsoft.com',
  
  // File Hosting
  'dropbox.com',
  'box.com',
  'onedrive.live.com',
  
  // Crypto/Finance (most are not frames)
  'coinbase.com',
  'binance.com',
  'kraken.com',
  'uniswap.org',
  'opensea.io',
];

// Check if URL domain is in the non-frame blacklist
function isDomainBlacklisted(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return NON_FRAME_DOMAINS.some(domain => 
      hostname === domain || hostname.startsWith(`www.${domain}`)
    );
  } catch {
    return false;
  }
}

// Cache interface for frame detection results
interface FrameCacheEntry {
  isFrame: boolean;
  timestamp: number;
  ttl: number;
}

// In-memory cache for frame detection results
const frameCache = new Map<string, FrameCacheEntry>();

// Rate limiting
const rateLimiter = {
  requests: new Map<string, number[]>(), // domain -> timestamps
  maxRequestsPerMinute: 10,
  
  canMakeRequest(domain: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!this.requests.has(domain)) {
      this.requests.set(domain, []);
    }
    
    const domainRequests = this.requests.get(domain)!;
    
    // Remove old requests outside the window
    const recentRequests = domainRequests.filter(timestamp => timestamp > windowStart);
    
    // Clean up memory: remove domain key if no recent requests
    if (recentRequests.length === 0) {
      this.requests.delete(domain);
    } else {
      this.requests.set(domain, recentRequests);
    }
    
    // Check if we can make another request
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }
    
    // Add current request timestamp - need to re-set or create the array
    if (recentRequests.length === 0) {
      this.requests.set(domain, [now]);
    } else {
      recentRequests.push(now);
      this.requests.set(domain, recentRequests);
    }
    
    return true;
  }
};

// Batch processing queue
const batchQueue = {
  pending: new Map<string, Promise<boolean>>(),
  
  // Get or create a promise for URL detection
  getOrCreateDetection(url: string): Promise<boolean> {
    if (this.pending.has(url)) {
      return this.pending.get(url)!;
    }
    
    const promise = this.detectSingle(url);
    this.pending.set(url, promise);
    
    // Clean up after completion
    promise.finally(() => {
      this.pending.delete(url);
    });
    
    return promise;
  },
  
  async detectSingle(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check rate limit
      if (!rateLimiter.canMakeRequest(domain)) {
        console.warn(`Rate limit exceeded for domain: ${domain}`);
        return false;
      }
      
      const response = await fetch(`/api/frames?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        return false;
      }
      
      const frameData = await response.json();
      
      // Check if we get back frame data (image, title, buttons, etc.)
      const isFrame = !!(frameData.image || frameData.title || frameData.buttons?.length > 0);
      
      // Cache the result
      const ttl = 5 * 60 * 1000; // 5 minutes TTL
      frameCache.set(url, {
        isFrame,
        timestamp: Date.now(),
        ttl
      });
      
      return isFrame;
    } catch (error) {
      console.warn(`Frame detection failed for URL: ${url}`, error);
      return false;
    }
  }
};

// Helper function to check cache validity
function getCachedResult(url: string): boolean | null {
  const cached = frameCache.get(url);
  if (!cached) return null;
  
  const now = Date.now();
  const isExpired = (now - cached.timestamp) > cached.ttl;
  
  if (isExpired) {
    frameCache.delete(url);
    return null;
  }
  
  return cached.isFrame;
}

// Utility to detect if a URL has Frame v2 metadata
export async function isFrameV2Url(url: string): Promise<boolean> {
  try {
    // Quick check - if domain is blacklisted, skip frame detection
    if (isDomainBlacklisted(url)) {
      return false;
    }
    
    // Check cache first
    const cachedResult = getCachedResult(url);
    if (cachedResult !== null) {
      return cachedResult;
    }
    
    // Use batch queue to prevent duplicate requests
    return await batchQueue.getOrCreateDetection(url);
  } catch (error) {
    console.warn(`Frame detection error for URL: ${url}`, error);
    return false;
  }
}

// Synchronous heuristic check for likely frame URLs (for performance)
export function isLikelyFrameUrl(url: string): boolean {
  // Quick check - if domain is blacklisted, it's definitely not a frame
  if (isDomainBlacklisted(url)) {
    return false;
  }
  
  const framePatterns = [
    /frames?\.js\.org/,
    /frame\./,
    /\.frame$/,
    /\/frame$/,
    /\/frames\//,
    // Add more patterns based on common frame domains
  ];
  
  // If it matches frame patterns, it's likely a frame
  const matchesPattern = framePatterns.some(pattern => pattern.test(url));
  
  // Return true if it matches patterns, otherwise let non-blacklisted URLs through for API check
  return matchesPattern || !isDomainBlacklisted(url);
}

// Utility functions for cache and batch management

// Clear expired cache entries (can be called periodically)
export function clearExpiredCache(): number {
  const now = Date.now();
  let clearedCount = 0;
  
  for (const [url, entry] of frameCache.entries()) {
    const isExpired = (now - entry.timestamp) > entry.ttl;
    if (isExpired) {
      frameCache.delete(url);
      clearedCount++;
    }
  }
  
  return clearedCount;
}

// Clear all cache entries
export function clearCache(): void {
  frameCache.clear();
}

// Get cache statistics
export function getCacheStats() {
  return {
    size: frameCache.size,
    entries: Array.from(frameCache.entries()).map(([url, entry]) => ({
      url,
      isFrame: entry.isFrame,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl
    }))
  };
}

// Batch process multiple URLs (useful for feed loading)
export async function batchCheckFrameUrls(urls: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  // Process URLs in chunks to avoid overwhelming the API
  const chunkSize = 3;
  const chunks: string[][] = [];
  
  for (let i = 0; i < urls.length; i += chunkSize) {
    chunks.push(urls.slice(i, i + chunkSize));
  }
  
  // Process chunks sequentially with a small delay
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const chunkPromises = chunk.map(async (url) => {
      const isFrame = await isFrameV2Url(url);
      results.set(url, isFrame);
      return { url, isFrame };
    });
    
    await Promise.all(chunkPromises);
    
    // Small delay between chunks to be API-friendly
    if (chunkIndex < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

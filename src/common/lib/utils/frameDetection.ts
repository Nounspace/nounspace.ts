/**
 * Frame Detection Utility
 * 
 * This utility detects whether a URL contains Farcaster Frame metadata (fc:frame tags)
 * by making API calls to /api/frames which uses frames.js to parse the HTML.
 * 
 * Key improvements over domain blacklisting:
 * - Actually checks for fc:frame metadata presence
 * - Uses frames.js library for accurate parsing
 * - Caches results to avoid redundant API calls
 * - Rate limits requests to be API-friendly
 * - Supports batch processing for feeds
 */

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
      
      // Use the isFrame property returned by the API to determine if this is a frame
      const isFrame = frameData.isFrame || false;
      
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

// Utility to detect if a URL has Farcaster Frame metadata by checking for fc:frame tags
// This replaces the previous domain blacklist approach with actual metadata detection
export async function isFrameV2Url(url: string): Promise<boolean> {
  try {
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
  const framePatterns = [
    /frames?\.js\.org/,
    /frame\./,
    /\.frame$/,
    /\/frame$/,
    /\/frames\//,
    // Add more patterns based on common frame domains
  ];
  
  // If it matches frame patterns, it's likely a frame
  return framePatterns.some(pattern => pattern.test(url));
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

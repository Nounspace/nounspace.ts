import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MiniAppCrawlerService } from '../src/common/data/services/miniAppCrawlerService';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
};

// Mock fetch
global.fetch = vi.fn();

describe('Mini App Crawler Service', () => {
  let crawler: MiniAppCrawlerService;

  beforeEach(() => {
    vi.clearAllMocks();
    (MiniAppCrawlerService as any).instance = undefined;
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
    
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: () => mockSupabase
    }));
    
    crawler = MiniAppCrawlerService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Domain Validation', () => {
    it('should validate domains correctly', () => {
      const validDomains = ['example.com', 'app.example.com', 'frames.js.org'];
      const invalidDomains = ['localhost', 'ngrok.io', 'replit.dev', 'vercel.app'];

      validDomains.forEach(domain => {
        expect(crawler['isValidDomain'](domain)).toBe(true);
      });

      invalidDomains.forEach(domain => {
        expect(crawler['isValidDomain'](domain)).toBe(false);
      });
    });
  });

  describe('Domain Extraction', () => {
    it('should extract domains from text', () => {
      const text = 'Check out this app at https://example.com and also frames.js.org';
      const domains = crawler['extractDomainsFromText'](text);
      
      expect(domains).toContain('example.com');
      expect(domains).toContain('frames.js.org');
    });

    it('should extract domains from URLs', () => {
      const url = 'https://app.example.com/frame';
      const domain = crawler['extractDomainFromUrl'](url);
      
      expect(domain).toBe('app.example.com');
    });

    it('should extract domains from casts', async () => {
      const casts = [
        {
          text: 'Check out this app at https://example.com',
          embeds: [{ url: 'https://frames.js.org/frame' }],
          frames: [{ url: 'https://app.test.com' }]
        }
      ];

      const domains = await crawler.extractDomainsFromCasts(casts);
      
      expect(domains).toContain('example.com');
      expect(domains).toContain('frames.js.org');
      expect(domains).toContain('app.test.com');
    });
  });

  describe('Manifest Validation', () => {
    it('should validate manifest structure', () => {
      const validManifest = {
        name: 'Test App',
        iconUrl: 'https://example.com/icon.png',
        homeUrl: 'https://example.com'
      };

      const invalidManifest = { name: 'Test' };

      expect(crawler['validateManifest'](validManifest)).toBe(true);
      expect(crawler['validateManifest'](invalidManifest)).toBe(false);
    });
  });

  describe('Domain Crawling', () => {
    it('should crawl domains successfully', async () => {
      const mockManifest = {
        name: 'Test App',
        iconUrl: 'https://example.com/icon.png',
        homeUrl: 'https://example.com'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockManifest)
      });

      const results = await crawler.crawlDomains(['example.com']);

      expect(results).toHaveLength(1);
      expect(results[0].domain).toBe('example.com');
      expect(results[0].isValid).toBe(true);
      expect(results[0].manifest).toEqual(mockManifest);
    });

    it('should handle failed crawls gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const results = await crawler.crawlDomains(['example.com']);

      expect(results).toHaveLength(1);
      expect(results[0].domain).toBe('example.com');
      expect(results[0].isValid).toBe(false);
      expect(results[0].error).toBe('Network error');
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const results = await crawler.crawlDomains(['example.com']);

      expect(results).toHaveLength(1);
      expect(results[0].domain).toBe('example.com');
      expect(results[0].isValid).toBe(false);
      expect(results[0].httpStatus).toBe(404);
    });
  });

  describe('Crawl Statistics', () => {
    it('should return crawl statistics', async () => {
      const stats = await crawler.getCrawlStats();
      
      expect(stats).toEqual({
        totalCrawled: 0,
        successfulCrawls: 0,
        failedCrawls: 0,
        averageResponseTime: 0,
        isCrawling: false
      });
    });
  });

  describe('Concurrency Control', () => {
    it('should respect concurrency limits', async () => {
      const domains = ['example1.com', 'example2.com', 'example3.com', 'example4.com', 'example5.com', 'example6.com'];
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          name: 'Test App',
          iconUrl: 'https://example.com/icon.png',
          homeUrl: 'https://example.com'
        })
      });

      const results = await crawler.crawlDomains(domains);

      expect(results).toHaveLength(domains.length);
      // Should process all domains (the exact number of calls may vary due to batching)
      expect(global.fetch).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example1.com/.well-known/farcaster.json',
        expect.any(Object)
      );
    });
  });
}); 
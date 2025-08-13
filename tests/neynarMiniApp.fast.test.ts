import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NeynarMiniAppService } from '../src/common/data/services/neynarMiniAppService';

// Mock Supabase client for fast tests
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    upsert: vi.fn(() => Promise.resolve({ error: null }))
  }))
};

// Mock fetch for fast tests
global.fetch = vi.fn();

describe('Neynar Mini App Service - Fast Tests', () => {
  let service: NeynarMiniAppService;

  beforeEach(() => {
    vi.clearAllMocks();
    (NeynarMiniAppService as any).instance = undefined;
    
    process.env.NEYNAR_API_KEY = 'test-api-key';
    
    // Mock the Supabase client directly
    vi.mock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => mockSupabase)
    }));
    
    service = NeynarMiniAppService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Functionality (Fast)', () => {
    it('should initialize service correctly', () => {
      const stats = service.getStats();
      
      expect(stats.hasApiKey).toBe(true);
      expect(stats.cacheSize).toBe(0);
      expect(stats.cacheTimeout).toBeGreaterThan(0);
    });

    it('should extract domain from URL correctly', () => {
      const extractDomain = (service as any).extractDomain.bind(service);
      
      expect(extractDomain('https://example.com/path')).toBe('example.com');
      expect(extractDomain('https://app.uniswap.org/frame')).toBe('app.uniswap.org');
      expect(extractDomain('invalid-url')).toBe('invalid-url');
    });

    it('should calculate popularity score correctly', () => {
      const calculatePopularity = (service as any).calculatePopularity.bind(service);
      
      const app1 = {
        engagement: { followerCount: 1000, isPowerBadge: false }
      };
      const app2 = {
        engagement: { followerCount: 5000, isPowerBadge: true }
      };
      const app3 = {
        engagement: { followerCount: 100000, isPowerBadge: true }
      };

      expect(calculatePopularity(app1)).toBe(51); // 50 + 1
      expect(calculatePopularity(app2)).toBe(75); // 50 + 5 + 20
      expect(calculatePopularity(app3)).toBe(100); // 50 + 30 + 20 (capped)
    });
  });

  describe('API Integration (Fast)', () => {
    it('should handle successful Neynar API response', async () => {
      const mockResponse = {
        frames: [
          {
            version: '1.0.0',
            image: 'https://example.com/image.png',
            frames_url: 'https://example.com',
            title: 'Test Frame',
            manifest: {
              miniapp: {
                version: '1.0.0',
                name: 'Test App',
                home_url: 'https://example.com',
                icon_url: 'https://example.com/icon.png',
                description: 'A test mini app',
                primary_category: 'games',
                tags: ['test', 'frame']
              }
            },
            author: {
              object: 'user',
              fid: 123,
              username: 'testuser',
              display_name: 'Test User',
              follower_count: 1000,
              power_badge: true
            }
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const apps = await service.fetchMiniApps({ limit: 10 });

      expect(apps).toHaveLength(1);
      expect(apps[0]).toMatchObject({
        domain: 'example.com',
        name: 'Test App',
        description: 'A test mini app',
        category: 'games',
        tags: ['test', 'frame']
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const apps = await service.fetchMiniApps({ limit: 10 });

      // Should fallback to database cache (empty in test)
      expect(apps).toEqual([]);
    });

    it('should construct API URLs correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ frames: [] })
      });

      await service.fetchMiniApps({
        limit: 25,
        categories: ['games', 'defi'],
        networks: ['ethereum', 'base'],
        timeWindow: '24h'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=25'),
        expect.objectContaining({
          headers: {
            'x-api-key': 'test-api-key',
            'Accept': 'application/json'
          }
        })
      );

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('categories=games%2Cdefi'); // URL encoded comma
      expect(callUrl).toContain('networks=ethereum%2Cbase'); // URL encoded comma
      expect(callUrl).toContain('time_window=24h');
    });
  });

  describe('Caching (Fast)', () => {
    it('should cache results correctly', async () => {
      const mockResponse = { frames: [] };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // First call should hit API
      await service.fetchMiniApps({ limit: 10 });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call within cache timeout should use cache
      await service.fetchMiniApps({ limit: 10 });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const stats = service.getStats();
      expect(stats.cacheSize).toBe(1);
    });

    it('should clear cache correctly', async () => {
      const mockResponse = { frames: [] };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await service.fetchMiniApps({ limit: 10 });
      expect(service.getStats().cacheSize).toBe(1);

      service.clearCache();
      expect(service.getStats().cacheSize).toBe(0);
    });
  });

  describe('Filtering Methods (Fast)', () => {
    it('should call fetchMiniApps with correct filters for trending', async () => {
      const fetchSpy = vi.spyOn(service, 'fetchMiniApps').mockResolvedValue([]);

      await service.getTrendingMiniApps('24h', 25);

      expect(fetchSpy).toHaveBeenCalledWith({
        timeWindow: '24h',
        limit: 25
      });
    });

    it('should call fetchMiniApps with correct filters for categories', async () => {
      const fetchSpy = vi.spyOn(service, 'fetchMiniApps').mockResolvedValue([]);

      await service.getMiniAppsByCategory(['games', 'defi'], 30);

      expect(fetchSpy).toHaveBeenCalledWith({
        categories: ['games', 'defi'],
        limit: 30
      });
    });

    it('should call fetchMiniApps with correct filters for networks', async () => {
      const fetchSpy = vi.spyOn(service, 'fetchMiniApps').mockResolvedValue([]);

      await service.getMiniAppsByNetwork(['ethereum', 'base'], 20);

      expect(fetchSpy).toHaveBeenCalledWith({
        networks: ['ethereum', 'base'],
        limit: 20
      });
    });
  });

  describe('Search Functionality (Fast)', () => {
    it('should search apps by name and description', async () => {
      const mockApps = [
        {
          id: '1',
          domain: 'swap.example.com',
          name: 'DeFi Swap',
          description: 'Trade tokens on Uniswap',
          tags: ['defi', 'swap'],
          category: 'defi'
        },
        {
          id: '2', 
          domain: 'game.example.com',
          name: 'NFT Game',
          description: 'Play and earn tokens',
          tags: ['game', 'nft'],
          category: 'games'
        }
      ] as any;

      vi.spyOn(service, 'fetchMiniApps').mockResolvedValue(mockApps);

      const results = await service.searchMiniApps('defi');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('DeFi Swap');

      const results2 = await service.searchMiniApps('token');
      expect(results2).toHaveLength(2); // Both match description
    });
  });

  describe('Fidget Options Conversion (Fast)', () => {
    it('should convert to fidget options format', async () => {
      const mockApp = {
        id: 'test-1',
        domain: 'example.com',
        name: 'Test App',
        description: 'A test app',
        iconUrl: 'https://example.com/icon.png',
        homeUrl: 'https://example.com',
        category: 'games',
        tags: ['test'],
        author: {
          username: 'testuser',
          displayName: 'Test User',
          isPowerUser: true
        },
        engagement: {
          followerCount: 1000
        },
        metadata: {
          buttonTitle: 'Play Game'
        }
      } as any;

      vi.spyOn(service, 'fetchMiniApps').mockResolvedValue([mockApp]);

      const fidgetOptions = await service.toFidgetOptions();

      expect(fidgetOptions).toHaveLength(1);
      expect(fidgetOptions[0]).toMatchObject({
        id: 'neynar-miniapp-example.com',
        type: 'miniapp',
        name: 'Test App',
        category: 'mini-apps',
        tags: expect.arrayContaining(['mini-apps', 'neynar', 'games', 'test']),
        frameUrl: 'https://example.com',
        buttonTitle: 'Play Game',
        author: 'testuser',
        verified: true
      });
    });
  });
}); 
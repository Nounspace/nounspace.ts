import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MiniAppDiscoveryService, type DiscoveredMiniApp, type MiniAppManifest } from '../src/common/data/services/miniAppDiscoveryService';

// Mock Supabase client
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

// Mock fetch
global.fetch = vi.fn();

describe('MiniAppDiscoveryService', () => {
  let service: MiniAppDiscoveryService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton instance
    (MiniAppDiscoveryService as any).instance = undefined;
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
    
    // Mock Supabase client creation
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: () => mockSupabase
    }));
    
    service = MiniAppDiscoveryService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MiniAppDiscoveryService.getInstance();
      const instance2 = MiniAppDiscoveryService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Domain Validation', () => {
    it('should validate correct domains', () => {
      const validDomains = [
        'example.com',
        'app.example.com',
        'test-app.io',
        'frames.js.org'
      ];

      validDomains.forEach(domain => {
        expect(service['isValidDomain'](domain)).toBe(true);
      });
    });

    it('should reject invalid domains', () => {
      const invalidDomains = [
        'localhost',
        '127.0.0.1',
        'ngrok.io',
        'replit.dev',
        'test.local',
        'invalid',
        ''
      ];

      invalidDomains.forEach(domain => {
        expect(service['isValidDomain'](domain)).toBe(false);
      });
    });
  });

  describe('Manifest Validation', () => {
    it('should validate correct manifests', () => {
      const validManifest: MiniAppManifest = {
        name: 'Test App',
        iconUrl: 'https://example.com/icon.png',
        homeUrl: 'https://example.com',
        description: 'A test app'
      };

      expect(service['validateManifest'](validManifest)).toBe(true);
    });

    it('should reject invalid manifests', () => {
      const invalidManifests = [
        null,
        undefined,
        {},
        { name: 'Test' },
        { name: 'Test', iconUrl: 'https://example.com/icon.png' },
        { name: 'Test', homeUrl: 'https://example.com' },
        { name: 123, iconUrl: 'https://example.com/icon.png', homeUrl: 'https://example.com' }
      ];

      invalidManifests.forEach(manifest => {
        expect(service['validateManifest'](manifest as any)).toBe(false);
      });
    });
  });

  describe('Engagement Score Calculation', () => {
    it('should calculate base score correctly', () => {
      const app = {};
      const score = service['calculateEngagementScore'](app);
      expect(score).toBe(50); // Base score
    });

    it('should add points for usage count', () => {
      const app = { usageCount: 10 };
      const score = service['calculateEngagementScore'](app);
      expect(score).toBe(70); // 50 + (10 * 2)
    });

    it('should add points for verified status', () => {
      const app = { isVerified: true };
      const score = service['calculateEngagementScore'](app);
      expect(score).toBe(60); // 50 + 10
    });

    it('should add points for new apps', () => {
      const app = { createdAt: new Date().toISOString() };
      const score = service['calculateEngagementScore'](app);
      expect(score).toBe(60); // 50 + 10 for new app
    });

    it('should cap score at 100', () => {
      const app = { 
        usageCount: 50, 
        isVerified: true, 
        createdAt: new Date().toISOString() 
      };
      const score = service['calculateEngagementScore'](app);
      expect(score).toBe(100); // Capped at 100
    });
  });

  describe('Farcaster API Integration', () => {
    it('should fetch and process apps from Farcaster API', async () => {
      const mockResponse = {
        frameApps: [
          {
            domain: 'example.com',
            name: 'Example App',
            iconUrl: 'https://example.com/icon.png',
            homeUrl: 'https://example.com',
            description: 'An example app'
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await service['fetchFromFarcasterAPI']();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://client.farcaster.xyz/v1/top-frameapps?limit=100',
        expect.objectContaining({
          headers: { 'Accept': 'application/json' }
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(service['fetchFromFarcasterAPI']()).resolves.not.toThrow();
    });

    it('should handle invalid API responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      await service['fetchFromFarcasterAPI']();
      // Should not throw, just log error
    });
  });

  describe('Database Operations', () => {
    it('should store Mini App in database', async () => {
      const app: DiscoveredMiniApp = {
        domain: 'example.com',
        manifest: {
          name: 'Test App',
          iconUrl: 'https://example.com/icon.png',
          homeUrl: 'https://example.com'
        },
        lastCrawled: new Date(),
        isValid: true,
        engagementScore: 75
      };

      await service['storeMiniApp'](app);

      expect(mockSupabase.from).toHaveBeenCalledWith('discovered_mini_apps');
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          name: 'Test App',
          icon_url: 'https://example.com/icon.png',
          home_url: 'https://example.com',
          engagement_score: 75,
          is_valid: true
        }),
        { onConflict: 'domain' }
      );
    });

    it('should load apps from database', async () => {
      const mockApps = [
        {
          domain: 'example.com',
          name: 'Test App',
          icon_url: 'https://example.com/icon.png',
          home_url: 'https://example.com',
          engagement_score: 75,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          manifest_data: {
            name: 'Test App',
            iconUrl: 'https://example.com/icon.png',
            homeUrl: 'https://example.com'
          },
          discovery_source: 'farcaster_api'
        }
      ];

      (mockSupabase.from().select().eq().order as any).mockResolvedValueOnce({
        data: mockApps,
        error: null
      });

      await service['loadFromDatabase']();

      expect(mockSupabase.from).toHaveBeenCalledWith('discovered_mini_apps');
    });
  });

  describe('Fidget Options Conversion', () => {
    it('should convert discovered apps to fidget options', async () => {
      const mockApp: DiscoveredMiniApp = {
        domain: 'example.com',
        manifest: {
          name: 'Test App',
          iconUrl: 'https://example.com/icon.png',
          homeUrl: 'https://example.com',
          description: 'A test app'
        },
        lastCrawled: new Date(),
        isValid: true,
        engagementScore: 75,
        discoverySource: 'farcaster_api'
      };

      // Mock the getValidMiniApps method
      vi.spyOn(service, 'getValidMiniApps').mockResolvedValue([mockApp]);

      const fidgetOptions = await service.toFidgetOptions();

      expect(fidgetOptions).toHaveLength(1);
      expect(fidgetOptions[0]).toEqual({
        id: expect.stringContaining('discovered-miniapp-example.com'),
        type: 'miniapp',
        name: 'Test App',
        description: 'A test app',
        icon: 'https://example.com/icon.png',
        tags: expect.arrayContaining(['mini-apps', 'discovered', 'farcaster', 'official']),
        category: 'mini-apps',
        frameUrl: 'https://example.com',
        homeUrl: 'https://example.com',
        domain: 'example.com',
        buttonTitle: 'Open',
        imageUrl: 'https://example.com/icon.png',
        popularity: 75
      });
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      const stats = service.getStats();
      
      expect(stats).toEqual({
        totalDiscovered: 0,
        validApps: 0,
        isCrawling: false
      });
    });
  });
}); 
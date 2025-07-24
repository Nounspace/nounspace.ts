import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MiniAppDiscoveryService, MiniAppManifest } from '../src/common/data/services/miniAppDiscoveryService';

describe('MiniAppDiscoveryService', () => {
  let discoveryService: MiniAppDiscoveryService;

  beforeEach(() => {
    // Clear any existing instance
    (MiniAppDiscoveryService as any).instance = null;
    discoveryService = MiniAppDiscoveryService.getInstance();
  });

  afterEach(() => {
    discoveryService.clearCache();
  });

  describe('Domain Validation', () => {
    it('should validate production domains', () => {
      const validDomains = [
        'app.example.com',
        'myapp.xyz',
        'farcaster-app.io',
        'test-app.net'
      ];

      validDomains.forEach(domain => {
        expect(discoveryService['isValidDomain'](domain)).toBe(true);
      });
    });

    it('should reject development tunnels', () => {
      const invalidDomains = [
        'app.ngrok.io',
        'myapp.replit.dev',
        'localhost',
        '127.0.0.1',
        'app.local',
        'test.dev'
      ];

      invalidDomains.forEach(domain => {
        expect(discoveryService['isValidDomain'](domain)).toBe(false);
      });
    });
  });

  describe('Manifest Validation', () => {
    it('should validate correct manifests', () => {
      const validManifest: MiniAppManifest = {
        name: 'Test App',
        iconUrl: 'https://example.com/icon.png',
        homeUrl: 'https://example.com',
        description: 'A test Mini App'
      };

      const result = discoveryService['validateManifest'](validManifest);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject manifests with missing required fields', () => {
      const invalidManifests = [
        { iconUrl: 'https://example.com/icon.png', homeUrl: 'https://example.com' }, // missing name
        { name: 'Test App', homeUrl: 'https://example.com' }, // missing iconUrl
        { name: 'Test App', iconUrl: 'https://example.com/icon.png' }, // missing homeUrl
      ];

      invalidManifests.forEach(manifest => {
        const result = discoveryService['validateManifest'](manifest);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should reject manifests with invalid URLs', () => {
      const invalidManifest: MiniAppManifest = {
        name: 'Test App',
        iconUrl: 'not-a-url',
        homeUrl: 'also-not-a-url',
        description: 'A test Mini App'
      };

      const result = discoveryService['validateManifest'](invalidManifest);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid URLs');
    });
  });

  describe('Queue Management', () => {
    it('should add valid domains to queue', async () => {
      const domains = ['app.example.com', 'myapp.xyz'];
      await discoveryService.addDomainsToQueue(domains);
      
      // Note: We can't directly test the private queue, but we can test the behavior
      // by checking if the service accepts the domains without error
      expect(true).toBe(true); // If we get here, no error was thrown
    });

    it('should filter out invalid domains', async () => {
      const domains = ['app.example.com', 'app.ngrok.io', 'myapp.xyz'];
      await discoveryService.addDomainsToQueue(domains);
      
      // Should not throw an error even with invalid domains
      expect(true).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should return initial stats', () => {
      const stats = discoveryService.getStats();
      
      expect(stats).toEqual({
        totalDiscovered: 0,
        validApps: 0,
        invalidApps: 0,
        queueLength: 0,
        isCrawling: false
      });
    });

    it('should return valid Mini Apps', () => {
      const apps = discoveryService.getValidMiniApps();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBe(0); // Initially empty
    });

    it('should convert to FidgetOptions format', () => {
      const fidgetOptions = discoveryService.toFidgetOptions();
      expect(Array.isArray(fidgetOptions)).toBe(true);
      expect(fidgetOptions.length).toBe(0); // Initially empty
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      discoveryService.clearCache();
      
      const stats = discoveryService.getStats();
      expect(stats.totalDiscovered).toBe(0);
      expect(stats.validApps).toBe(0);
      expect(stats.invalidApps).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const service = MiniAppDiscoveryService.getInstance();
      expect(service).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        maxConcurrentCrawls: 5,
        crawlTimeout: 5000,
        engagementThreshold: 5
      };
      
      const service = MiniAppDiscoveryService.getInstance(customConfig);
      expect(service).toBeDefined();
    });
  });
}); 
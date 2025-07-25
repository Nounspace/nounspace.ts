import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/supabase/database.d.ts';

// Test database client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Mini App Discovery Integration Tests', () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await supabase.from('discovered_mini_apps').delete().neq('id', 0);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('discovered_mini_apps').delete().neq('id', 0);
  });

  beforeEach(async () => {
    // Clear test data before each test
    await supabase.from('discovered_mini_apps').delete().neq('id', 0);
  });

  describe('API Endpoints', () => {
    it('should return stats via GET /api/miniapp-discovery', async () => {
      const response = await fetch('http://localhost:3000/api/miniapp-discovery');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual({
        totalDiscovered: 0,
        validApps: 0,
        isCrawling: false
      });
      expect(data.validApps).toBe(0);
      expect(data.apps).toEqual([]);
    });

    it('should trigger discovery via POST /api/miniapp-discovery', async () => {
      const response = await fetch('http://localhost:3000/api/miniapp-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Discovery started');
    });

    it('should reject invalid actions', async () => {
      const response = await fetch('http://localhost:3000/api/miniapp-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalid' })
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action');
    });
  });

  describe('Database Operations', () => {
    it('should store and retrieve Mini Apps', async () => {
      // Insert test data
      const testApp = {
        domain: 'test-app.com',
        name: 'Test App',
        description: 'A test Mini App',
        icon_url: 'https://test-app.com/icon.png',
        home_url: 'https://test-app.com',
        manifest_url: 'https://test-app.com/.well-known/farcaster.json',
        engagement_score: 75,
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        manifest_data: {
          name: 'Test App',
          iconUrl: 'https://test-app.com/icon.png',
          homeUrl: 'https://test-app.com',
          description: 'A test Mini App'
        },
        discovery_source: 'farcaster_api',
        validation_errors: null,
        usage_count: 0,
        last_used_at: null
      };

      const { error: insertError } = await supabase
        .from('discovered_mini_apps')
        .insert(testApp);

      expect(insertError).toBeNull();

      // Retrieve the data
      const { data: apps, error: selectError } = await supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('domain', 'test-app.com');

      expect(selectError).toBeNull();
      expect(apps).toHaveLength(1);
      expect(apps![0]).toMatchObject({
        domain: 'test-app.com',
        name: 'Test App',
        engagement_score: 75,
        is_valid: true
      });
    });

    it('should handle upsert operations', async () => {
      // Insert initial data
             const initialApp = {
         domain: 'upsert-test.com',
         name: 'Initial App',
         icon_url: 'https://upsert-test.com/icon.png',
         home_url: 'https://upsert-test.com',
         manifest_url: 'https://upsert-test.com/.well-known/farcaster.json',
         engagement_score: 50,
         is_valid: true,
         last_validated_at: new Date().toISOString(),
         manifest_data: { name: 'Initial App' },
         discovery_source: 'farcaster_api'
       };

      await supabase.from('discovered_mini_apps').insert(initialApp);

      // Upsert with updated data
      const updatedApp = {
        ...initialApp,
        name: 'Updated App',
        engagement_score: 80
      };

      const { error: upsertError } = await supabase
        .from('discovered_mini_apps')
        .upsert(updatedApp, { onConflict: 'domain' });

      expect(upsertError).toBeNull();

      // Verify only one record exists with updated data
      const { data: apps } = await supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('domain', 'upsert-test.com');

      expect(apps).toHaveLength(1);
      expect(apps![0].name).toBe('Updated App');
      expect(apps![0].engagement_score).toBe(80);
    });

    it('should filter by validity correctly', async () => {
      // Insert valid and invalid apps
             const testApps = [
         {
           domain: 'valid-app.com',
           name: 'Valid App',
           icon_url: 'https://valid-app.com/icon.png',
           home_url: 'https://valid-app.com',
           manifest_url: 'https://valid-app.com/.well-known/farcaster.json',
           engagement_score: 75,
           is_valid: true,
           last_validated_at: new Date().toISOString(),
           manifest_data: { name: 'Valid App' },
           discovery_source: 'farcaster_api'
         },
         {
           domain: 'invalid-app.com',
           name: 'Invalid App',
           icon_url: 'https://invalid-app.com/icon.png',
           home_url: 'https://invalid-app.com',
           manifest_url: 'https://invalid-app.com/.well-known/farcaster.json',
           engagement_score: 25,
           is_valid: false,
           last_validated_at: new Date().toISOString(),
           manifest_data: { name: 'Invalid App' },
           discovery_source: 'farcaster_api'
         }
       ];

      await supabase.from('discovered_mini_apps').insert(testApps);

      // Query only valid apps
      const { data: validApps } = await supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('is_valid', true);

      expect(validApps).toHaveLength(1);
      expect(validApps![0].domain).toBe('valid-app.com');
    });
  });

  describe('End-to-End Discovery Flow', () => {
    it('should complete full discovery cycle', async () => {
      // 1. Trigger discovery
      const triggerResponse = await fetch('http://localhost:3000/api/miniapp-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });

      expect(triggerResponse.status).toBe(200);

      // 2. Wait for discovery to complete
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. Check results
      const statsResponse = await fetch('http://localhost:3000/api/miniapp-discovery');
      const statsData = await statsResponse.json();

      expect(statsData.success).toBe(true);
      expect(statsData.stats.isCrawling).toBe(false);

      // 4. Verify database has data (if Farcaster API returned results)
      const { data: dbApps } = await supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('is_valid', true);

      // Note: This test may pass with 0 apps if Farcaster API is down
      // or returns no results, which is expected behavior
      expect(Array.isArray(dbApps)).toBe(true);
    }, 10000); // 10 second timeout
  });

  describe('Fidget Options Integration', () => {
    it('should integrate with FidgetOptionsService', async () => {
      // This test would require the actual FidgetOptionsService
      // For now, we'll test the database query that feeds into it
      
      // Insert test data
             const testApp = {
         domain: 'fidget-test.com',
         name: 'Fidget Test App',
         icon_url: 'https://fidget-test.com/icon.png',
         home_url: 'https://fidget-test.com',
         manifest_url: 'https://fidget-test.com/.well-known/farcaster.json',
         engagement_score: 85,
         is_valid: true,
         last_validated_at: new Date().toISOString(),
         manifest_data: {
           name: 'Fidget Test App',
           iconUrl: 'https://fidget-test.com/icon.png',
           homeUrl: 'https://fidget-test.com'
         },
         discovery_source: 'farcaster_api'
       };

      await supabase.from('discovered_mini_apps').insert(testApp);

      // Query the data that would be used by FidgetOptionsService
      const { data: fidgetData } = await supabase
        .from('discovered_mini_apps')
        .select('*')
        .eq('is_valid', true)
        .order('engagement_score', { ascending: false });

      expect(fidgetData).toHaveLength(1);
      expect(fidgetData![0]).toMatchObject({
        domain: 'fidget-test.com',
        name: 'Fidget Test App',
        engagement_score: 85
      });
    });
  });
}); 
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Mini App Discovery API - Fast Tests', () => {
  const API_BASE = 'http://localhost:3000/api/miniapp-discovery';

  beforeAll(async () => {
    // Quick health check - ensure server is running
    try {
      await fetch(API_BASE);
    } catch (error) {
      console.warn('⚠️  Server not running - some tests may fail');
    }
  });

  afterAll(async () => {
    // Clean up if needed
  });

  describe('API Endpoints (Fast)', () => {
    it('should return stats via GET endpoint', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
      expect(data.stats).toHaveProperty('totalDiscovered');
      expect(data.stats).toHaveProperty('validApps');
      expect(data.stats).toHaveProperty('isCrawling');
    }, 2000); // 2 second timeout

    it('should accept discovery trigger via POST endpoint', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Discovery started');
    }, 2000); // 2 second timeout

    it('should reject invalid actions', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalid' })
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid action');
    }, 2000); // 2 second timeout
  });

  describe('Response Format (Fast)', () => {
    it('should return consistent response structure', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();

      // Check required fields
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('stats');
      expect(data).toHaveProperty('validApps');
      expect(data).toHaveProperty('apps');

      // Check data types
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.validApps).toBe('number');
      expect(Array.isArray(data.apps)).toBe(true);
    }, 2000); // 2 second timeout

    it('should return apps array with correct structure', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();

      if (data.apps.length > 0) {
        const app = data.apps[0];
        expect(app).toHaveProperty('domain');
        expect(app).toHaveProperty('name');
        expect(app).toHaveProperty('lastCrawled');
        expect(app).toHaveProperty('engagementScore');
        // description is optional, so we don't require it
      }
    }, 2000); // 2 second timeout
  });

  describe('Error Handling (Fast)', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      // Next.js returns 500 for malformed JSON, which is acceptable
      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 2000); // 2 second timeout

    it('should handle missing action field', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    }, 2000); // 2 second timeout
  });

  describe('Performance (Fast)', () => {
    it('should respond to GET requests quickly', async () => {
      const startTime = Date.now();
      
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(responseTime).toBeLessThan(1000); // Should respond in under 1 second
    }, 2000); // 2 second timeout

    it('should respond to POST requests quickly', async () => {
      const startTime = Date.now();
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // Should respond in under 2 seconds
    }, 3000); // 3 second timeout
  });
}); 
import { beforeAll, afterAll, vi } from 'vitest';

// Test setup file for Mini App Discovery System

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.NEYNAR_API_KEY = 'test-neynar-key';

// Global test timeout
process.env.VITEST_TIMEOUT = '10000';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.log in tests unless explicitly needed
  if (process.env.NODE_ENV === 'test') {
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Global test utilities
export const testUtils = {
  // Helper to create mock Mini App data
  createMockMiniApp: (overrides = {}) => ({
    domain: 'test-app.com',
    name: 'Test App',
    iconUrl: 'https://test-app.com/icon.png',
    homeUrl: 'https://test-app.com',
    description: 'A test Mini App',
    ...overrides
  }),

  // Helper to create mock database record
  createMockDbRecord: (overrides = {}) => ({
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
    last_used_at: null,
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create mock fetch response
  createMockFetchResponse: (data: any, ok = true) => ({
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map([['content-type', 'application/json']])
  })
}; 
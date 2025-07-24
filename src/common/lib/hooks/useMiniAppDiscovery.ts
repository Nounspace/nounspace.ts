import { useEffect, useState } from 'react';
import { MiniAppDiscoveryService } from '@/common/data/services/miniAppDiscoveryService';

export interface DiscoveryStats {
  totalDiscovered: number;
  validApps: number;
  invalidApps: number;
  queueLength: number;
  isCrawling: boolean;
}

export function useMiniAppDiscovery() {
  const [stats, setStats] = useState<DiscoveryStats | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDiscovery = async () => {
      try {
        const discoveryService = MiniAppDiscoveryService.getInstance();
        
        // Schedule automatic re-indexing
        discoveryService.scheduleReindexing();
        
        // Start initial discovery from seeds
        await discoveryService.discoverFromSeeds();
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Mini App discovery:', err);
        setError('Failed to initialize discovery service');
      }
    };

    // Only initialize once
    if (!isInitialized) {
      initializeDiscovery();
    }
  }, [isInitialized]);

  const refreshStats = async () => {
    try {
      const discoveryService = MiniAppDiscoveryService.getInstance();
      const newStats = discoveryService.getStats();
      setStats(newStats);
      setError(null);
    } catch (err) {
      setError('Failed to refresh stats');
    }
  };

  const triggerDiscovery = async () => {
    try {
      const discoveryService = MiniAppDiscoveryService.getInstance();
      await discoveryService.discoverFromSeeds();
      await refreshStats();
    } catch (err) {
      setError('Failed to trigger discovery');
    }
  };

  const addDomainsToQueue = async (domains: string[]) => {
    try {
      const discoveryService = MiniAppDiscoveryService.getInstance();
      await discoveryService.addDomainsToQueue(domains);
      await refreshStats();
    } catch (err) {
      setError('Failed to add domains to queue');
    }
  };

  const reindexAll = async () => {
    try {
      const discoveryService = MiniAppDiscoveryService.getInstance();
      const allDomains = Array.from(discoveryService.getValidMiniApps().map(app => app.domain));
      await discoveryService.addDomainsToQueue(allDomains);
      await refreshStats();
    } catch (err) {
      setError('Failed to reindex all apps');
    }
  };

  const clearCache = () => {
    try {
      const discoveryService = MiniAppDiscoveryService.getInstance();
      discoveryService.clearCache();
      setStats(null);
      setError(null);
    } catch (err) {
      setError('Failed to clear cache');
    }
  };

  // Refresh stats periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      refreshStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Initial stats fetch
  useEffect(() => {
    if (isInitialized) {
      refreshStats();
    }
  }, [isInitialized]);

  return {
    stats,
    isInitialized,
    error,
    refreshStats,
    triggerDiscovery,
    addDomainsToQueue,
    reindexAll,
    clearCache,
  };
} 
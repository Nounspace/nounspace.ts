import { useMemo } from 'react';
import { loadSystemConfig, SystemConfig } from '@/config';

// Global configuration cache
let cachedConfig: SystemConfig | null = null;

export const useSystemConfig = (): SystemConfig => {
  return useMemo(() => {
    if (cachedConfig) {
      return cachedConfig;
    }
    
    cachedConfig = loadSystemConfig();
    return cachedConfig;
  }, []);
};

// Export for direct usage
export { loadSystemConfig };
export type { SystemConfig };

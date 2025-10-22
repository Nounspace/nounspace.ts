import { nounsSystemConfig, SystemConfig } from './systemConfig';

// Configuration loader
export const loadSystemConfig = (): SystemConfig => {
  // For now, return the Nouns configuration
  // In the future, this could load different configurations based on environment variables
  // or other criteria
  return nounsSystemConfig;
};

// Export the configuration
export { nounsSystemConfig };
export type { SystemConfig };

// Export individual configuration modules
export { nounsBrand } from './brand/nouns.brand';
export { nounsAssets } from './assets/nouns.assets';
export { nounsTheme } from './theme/nouns.theme';
export { nounsContent } from './content/nouns.content';
export { nounsCommunity } from './community/nouns.community';
export { nounsFidgets } from './fidgets/nouns.fidgets';
export { nounsHomePage } from './home/nouns.home';
export { nounsSpaces } from './spaces/nouns.spaces';

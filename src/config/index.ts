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
export { nounsCommunity } from './community/nouns.community';
export { nounsFidgets } from './fidgets/nouns.fidgets';
export { nounsHomePage } from './spaces/nouns.home';

// Export the initial space creators from config
export { default as createInitialProfileSpaceConfigForFid } from './spaces/initialProfileSpace';
export { default as createInitialChannelSpaceConfig } from './spaces/initialChannelSpace';
export { default as createInitialTokenSpaceConfigForAddress } from './spaces/initialTokenSpace';
export { default as createInitalProposalSpaceConfigForProposalId } from './spaces/initialProposalSpace';
export { default as INITIAL_HOMEBASE_CONFIG } from './spaces/initialHomebase';

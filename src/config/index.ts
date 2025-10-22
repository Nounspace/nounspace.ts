import { nounsSystemConfig } from './nouns/index';
import { exampleSystemConfig } from './example/index';
import { SystemConfig } from './systemConfig';

// Available community configurations
const AVAILABLE_CONFIGURATIONS = ['nouns', 'example'] as const;
type CommunityConfig = typeof AVAILABLE_CONFIGURATIONS[number];

// Configuration loader
export const loadSystemConfig = (): SystemConfig => {
  // Get the community configuration from environment variable
  const communityConfig = process.env.NEXT_PUBLIC_COMMUNITY || 'nouns';
  
  // Validate the configuration
  if (!isValidCommunityConfig(communityConfig)) {
    console.warn(
      `Invalid community configuration: "${communityConfig}". ` +
      `Available options: ${AVAILABLE_CONFIGURATIONS.join(', ')}. ` +
      `Falling back to "nouns" configuration.`
    );
  }
  
  // Switch between available configurations
  switch (communityConfig.toLowerCase()) {
    case 'nouns':
      return nounsSystemConfig;
    case 'example':
      return exampleSystemConfig;
    // Add more community configurations here as they are created
    default:
      return nounsSystemConfig;
  }
};

// Helper function to validate community configuration
function isValidCommunityConfig(config: string): config is CommunityConfig {
  return AVAILABLE_CONFIGURATIONS.includes(config.toLowerCase() as CommunityConfig);
}

// Export available configurations for reference
export { AVAILABLE_CONFIGURATIONS };

// Export the configurations
export { nounsSystemConfig } from './nouns/index';
export { exampleSystemConfig } from './example/index';
export type { SystemConfig };

// Export individual configuration modules from nouns
export * from './nouns/index';

// Export individual configuration modules from example
export * from './example/index';

// Export space creators - these will be loaded based on environment variable at build time
// The actual imports are handled by the build process
export {
  createInitialProfileSpaceConfigForFid,
  createInitialChannelSpaceConfig,
  createInitialTokenSpaceConfigForAddress,
  createInitalProposalSpaceConfigForProposalId,
  INITIAL_HOMEBASE_CONFIG
} from './nouns/initialSpaces';

// Export initial space config
export { INITIAL_SPACE_CONFIG_EMPTY } from './initialSpaceConfig';

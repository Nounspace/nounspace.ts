import { SpaceConfig } from "@/app/(spaces)/Space";
import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

export const NOUNS_TAB_CONFIG = config.homePage.tabs["Nouns"];
export const SOCIAL_TAB_CONFIG = config.homePage.tabs["Social"];
export const GOVERNANCE_TAB_CONFIG = config.homePage.tabs["Governance"];
export const RESOURCES_TAB_CONFIG = config.homePage.tabs["Resources"];
export const FUNDED_WORKS_TAB_CONFIG = config.homePage.tabs["Funded Works"];
export const PLACES_TAB_CONFIG = config.homePage.tabs["Places"];

// Export all configurations
export const HOMEBASE_TABS_CONFIG = {
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  RESOURCES_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
  PLACES_TAB_CONFIG,
};
import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

export const SPACE_CONTRACT_ADDR = config.community.contracts.space;

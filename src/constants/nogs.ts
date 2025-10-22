import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

export const NOGS_CONTRACT_ADDR = config.community.contracts.nogs;

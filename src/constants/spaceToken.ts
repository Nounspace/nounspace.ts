import { loadSystemConfig } from "@/config";
import type { Address } from "viem";

// Load system configuration
const config = loadSystemConfig();

export const SPACE_CONTRACT_ADDR: Address = config.community.contracts.space as Address;

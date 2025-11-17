import type { Address } from "viem";
import { isAddress } from "viem";

import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

const spaceContractAddress = config.community.contracts.space;

if (!isAddress(spaceContractAddress)) {
  throw new Error(
    "Invalid space contract address configured. Expected a checksummed 0x-prefixed address.",
  );
}

export const SPACE_CONTRACT_ADDR: Address = spaceContractAddress;

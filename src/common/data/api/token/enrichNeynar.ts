import { chunk } from "lodash";
import type {
  DirectoryDependencies,
  NeynarBulkUsersResponse,
  NeynarUser,
  TokenHolder,
} from "./types";
import { normalizeAddress, extractOwnerAddress } from "./utils";
import { NEYNAR_LOOKUP_BATCH_SIZE } from "./utils";

/**
 * Maps Neynar bulk response to address-keyed record
 */
function mapNeynarUsersByAddress(
  addressRecords: NeynarBulkUsersResponse,
): Record<string, NeynarUser | undefined> {
  return Object.fromEntries(
    Object.entries(addressRecords).map(([address, users]) => [
      normalizeAddress(address),
      Array.isArray(users) && users.length > 0 ? users[0] : undefined,
    ]),
  );
}

/**
 * Enriches token holders with Neynar profile data
 */
export async function enrichWithNeynar(
  holders: TokenHolder[],
  deps: DirectoryDependencies,
): Promise<Record<string, NeynarUser | undefined>> {
  if (!process.env.NEYNAR_API_KEY) {
    return {};
  }

  const addresses = holders
    .map((holder) => {
      const address = extractOwnerAddress(holder);
      return address ? normalizeAddress(address) : null;
    })
    .filter((value): value is string => Boolean(value));
  const uniqueAddresses = Array.from(new Set(addresses));

  if (uniqueAddresses.length === 0) {
    return {};
  }

  let neynarProfiles: Record<string, NeynarUser | undefined> = {};
  const batches = chunk(uniqueAddresses, NEYNAR_LOOKUP_BATCH_SIZE);

  for (const batch of batches) {
    if (batch.length === 0) continue;
    try {
      const response = await deps.neynarClient.fetchBulkUsersByEthOrSolAddress({
        addresses: batch,
      });
      neynarProfiles = {
        ...neynarProfiles,
        ...mapNeynarUsersByAddress(response),
      };
    } catch (error) {
      console.error("Failed to fetch Neynar profiles", error);
    }
  }

  return neynarProfiles;
}


import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { MasterToken } from "@/common/providers/TokenProvider";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "./clanker";
import { fetchEmpireByAddress } from "./empireBuilder";

/**
 * Server-side version of fetchMasterToken
 * Loads comprehensive token data by aggregating from multiple sources:
 * - Gecko API for token metadata
 * - Clanker API for Base network tokens
 * - Empire Builder API for token ownership
 */
export async function fetchMasterTokenServer(
  address: string,
  network: EtherScanChainName,
): Promise<MasterToken> {
  // console.log("Fetching token data...", address);
  const tokenResponse = await fetchTokenData(
    address,
    null,
    String(network),
  );

  const [clankerResponse, empireResponse] = await Promise.all([
    // Only fetch Clanker data for Base network tokens (optimization)
    network === "base" 
      ? fetchClankerByAddress(address as Address)
      : Promise.resolve(null),
    fetchEmpireByAddress(address as Address),
  ]);

  return {
    network: network,
    geckoData: tokenResponse,
    clankerData: clankerResponse,
    empireData: empireResponse,
  };
}

import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { MasterToken } from "@/common/types/token";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "./clanker";
import { fetchEmpireByAddress } from "./empireBuilder";

/**
 * Loads comprehensive token data by aggregating from multiple sources:
 * - Gecko API for token metadata
 * - Clanker API for Base network tokens
 * - Empire Builder API for token ownership
 */
export async function loadTokenData(
  contractAddress: Address,
  network: EtherScanChainName
): Promise<MasterToken | undefined> {
  try {
    const [tokenResponse, clankerResponse, empireResponse] = await Promise.all([
      fetchTokenData(contractAddress, null, network),
      network === "base" ? fetchClankerByAddress(contractAddress) : Promise.resolve(null),
      fetchEmpireByAddress(contractAddress),
    ]);

    return {
      network,
      geckoData: tokenResponse,
      clankerData: clankerResponse,
      empireData: empireResponse,
    };
  } catch (error) {
    console.error("Failed to load token data:", error);
    return undefined;
  }
}

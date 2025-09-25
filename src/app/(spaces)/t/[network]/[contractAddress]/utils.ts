import { isNil, isString, isUndefined } from "lodash";
import {
  contractOwnerFromContract,
  loadViemViewOnlyContract,
  OwnerType,
} from "@/common/data/api/etherscan";
import {
  loadOwnedItentitiesForFid,
  loadOwnedItentitiesForWalletAddress,
} from "@/common/data/database/supabase/serverHelpers";
import { tokenRequestorFromContractAddress, TokenOwnerLookup } from "@/common/data/queries/clanker";
import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import { unstable_noStore as noStore } from 'next/cache';
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { TokenSpacePageData, SPACE_TYPES } from "@/common/types/spaceData";
import { MasterToken as _MasterToken } from "@/common/providers/TokenProvider";
import { loadTokenData } from "@/common/data/queries/tokenData";
import createInitialTokenSpaceConfigForAddress from "@/constants/initialTokenSpace";

const ETH_CONTRACT_ADDRESS_REGEX = new RegExp(/^0x[a-fA-F0-9]{40}$/);

/**
 * Validates a contract address format
 */
export function validateContractAddress(contractAddress: string | null): boolean {
  if (
    isNil(contractAddress) ||
    !ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress)
  ) {
    return false;
  }
  return true;
}

/**
 * Loads internal platform data for a token space from the database
 */
export async function loadInternalSpaceData(
  contractAddress: string,
  network: string,
): Promise<{
  spaceId?: string;
  registeredFid?: number;
  identityPublicKey?: string;
  spaceName?: string;
}> {
  console.log("[loadInternalSpaceData] Querying database for space registration:", {
    contractAddress,
    network: isString(network) ? network : "any"
  });
  
  let query = createSupabaseServerClient()
    .from("spaceRegistrations")
    .select(
      "spaceId, spaceName, contractAddress, network, identityPublicKey, fidRegistrations(fid)"
    )
    .eq("contractAddress", contractAddress);

  if (isString(network)) {
    query = query.eq("network", network);
  }

  const { data, error } = await query
    .order("timestamp", { ascending: true })
    .limit(1);
    
  if (error) {
    console.error("[loadInternalSpaceData] Database query error:", error);
    return {};
  }
  
  const registrationRow = data?.[0];
  
  if (!registrationRow) {
    return {};
  }

  const spaceId = registrationRow.spaceId;
  const registeredFid = Array.isArray(registrationRow.fidRegistrations)
    ? registrationRow.fidRegistrations[0]?.fid
    : registrationRow.fidRegistrations?.fid;
  const identityPublicKey = registrationRow.identityPublicKey;
  const spaceName = registrationRow.spaceName;

  return {
    spaceId,
    registeredFid,
    identityPublicKey,
    spaceName
  };
}

/**
 * Get token ownership information
 */
export async function resolveTokenOwnership(
  contractAddress: string,
  network: string
): Promise<{
  ownerId: string | null;
  ownerIdType: OwnerType;
  owningIdentities: string[];
}> {
  // First try the token requestor which checks Clanker + Empire
  let tokenOwnership: TokenOwnerLookup | null = null;
  try {
    tokenOwnership = await tokenRequestorFromContractAddress(contractAddress);
  } catch (error) {
    console.error("[resolveTokenOwnership] Error in token requestor:", error);
  }
  
  // If no owner found via APIs, try blockchain fallback
  let ownerId = tokenOwnership?.ownerId || null;
  let ownerIdType = tokenOwnership?.ownerIdType || "address";
  
  if (isNil(ownerId)) {
    try {
      const contractData = await loadViemViewOnlyContract(
        contractAddress,
        isString(network) ? network : undefined,
      );
      
      if (!isUndefined(contractData)) {
        const { contract, abi } = contractData;
        const ownerData = await contractOwnerFromContract(
          contract,
          abi,
          contractAddress,
          isString(network) ? network : undefined,
        );
        
        ownerId = ownerData.ownerId || null;
        ownerIdType = ownerData.ownerIdType;
      }
    } catch (error) {
      console.error("[resolveTokenOwnership] Error in contract ownership fallback:", error);
    }
  }
  
  // Load identity keys based on resolved owner
  let owningIdentities: string[] = [];
  if (!isNil(ownerId)) {
    if (ownerIdType === "address") {
      owningIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
    } else {
      owningIdentities = await loadOwnedItentitiesForFid(ownerId);
    }
  }
  
  return {
    ownerId,
    ownerIdType,
    owningIdentities
  };
}

/**
 * Main function to load token space data for page component
 */
export const loadTokenSpacePageData = async (
  contractAddress: string,
  network: string,
  tabNameParam?: string
): Promise<Omit<TokenSpacePageData, 'isEditable' | 'spacePageUrl'> | null> => {
  noStore();

  if (!validateContractAddress(contractAddress)) {
    return null;
  }
  
  // Get token data (price, symbol, etc)
  const tokenData = await loadTokenData(contractAddress as Address, network as EtherScanChainName);
  
  // Get ownership information
  const ownership = await resolveTokenOwnership(contractAddress, network);
  
  // Get internal platform data
  const internalData = await loadInternalSpaceData(contractAddress, network);
  
  // Resolve final ownership data using both sources
  const finalOwnerId = !isNil(internalData.registeredFid) 
    ? String(internalData.registeredFid) 
    : ownership.ownerId;
  
  const finalOwnerType = !isNil(internalData.registeredFid) 
    ? "fid" as OwnerType 
    : ownership.ownerIdType;
  
  // Add identityPublicKey to owningIdentities if not already included
  const finalOwningIdentities = [...ownership.owningIdentities];
  if (internalData.identityPublicKey && !finalOwningIdentities.includes(internalData.identityPublicKey)) {
    finalOwningIdentities.push(internalData.identityPublicKey);
  }

  const tabName = tabNameParam || "Token";
  const spaceName = internalData.spaceName || `Token ${contractAddress}`;
  
  // Get symbol from tokenData for the config
  const symbol = tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";
  const castHash = tokenData?.clankerData?.cast_hash || "";
  const casterFid = String(tokenData?.clankerData?.requestor_fid || "");
  const isClankerToken = !!tokenData?.clankerData;
  
  // Create space config
  const config = {
    ...createInitialTokenSpaceConfigForAddress(
      contractAddress,
      castHash,
      casterFid,
      symbol,
      isClankerToken,
      network as EtherScanChainName
    ),
    timestamp: new Date().toISOString(),
  };
  
  // Convert ownerId to the appropriate type based on ownerIdType
  const spaceOwnerFid = finalOwnerType === 'fid' ? Number(finalOwnerId) : undefined;
  const spaceOwnerAddress = finalOwnerType === 'address' && finalOwnerId ? 
    finalOwnerId as Address : 
    "0x0000000000000000000000000000000000000000" as Address;
    
  return {
    spaceId: internalData.spaceId,
    spaceName,
    spaceType: SPACE_TYPES.TOKEN,
    updatedAt: new Date().toISOString(),
    defaultTab: "Token",
    currentTab: tabName,
    spaceOwnerFid,
    spaceOwnerAddress,
    config,
    contractAddress,
    network,
    tokenData,
  };
};

import { isNil, isString, isUndefined } from "lodash"; // cloneDeep imported but not used
import {
  contractOwnerFromContract,
  loadViemViewOnlyContract,
  OwnerType,
} from "@/common/data/api/etherscan";
import {
  loadOwnedItentitiesForFid,
  loadOwnedItentitiesForWalletAddress,
} from "@/common/data/database/supabase/serverHelpers";
import { tokenRequestorFromContractAddress } from "@/common/data/queries/clanker";
import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import { unstable_noStore as noStore } from 'next/cache';
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { TokenSpaceData, SPACE_TYPES } from "@/common/types/spaceData";
import { MasterToken } from "@/common/providers/TokenProvider";
import { loadTokenData } from "@/common/data/queries/tokenData";
import createInitialTokenSpaceConfigForAddress from "@/constants/initialTokenSpace";
const ETH_CONTRACT_ADDRESS_REGEX = new RegExp(/^0x[a-fA-F0-9]{40}$/);

const defaultContractPageProps = {
  spaceId: undefined,
  ownerId: null,
  ownerIdType: "address" as OwnerType,
  tabName: "Profile",
  contractAddress: null,
  owningIdentities: [],
  network: "base",
};

export async function loadTokenSpaceMetadata(
  params: Record<string, string | string[]>,
) {

  noStore();
  if (isUndefined(params)) {
    return {
      props: defaultContractPageProps,
    };
  }

  const { contractAddress, tabName: tabNameUnparsed, network } = params;
  console.log("[loadTokenSpaceMetadata] Contract address validation:", { 
    contractAddress, 
    network,
    isNil: isNil(contractAddress),
    isArray: Array.isArray(contractAddress),
    matchesRegex: contractAddress && !Array.isArray(contractAddress) 
      ? ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress) 
      : false
  });
  
  const tabName = isString(tabNameUnparsed) ? tabNameUnparsed : "Profile";
  if (
    isNil(contractAddress) ||
    Array.isArray(contractAddress) ||
    !ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress)
  ) {
    console.log("[loadTokenSpaceMetadata] Contract address validation failed, returning default props");
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
      },
    };
  }
  const contractAddressStr = contractAddress as string;
  // console.log("network contractPageProps", network);

  console.log("[loadTokenSpaceMetadata] Loading contract data for:", {
    contractAddressStr,
    network: isString(network) ? network : undefined
  });
  
  const contractData = await loadViemViewOnlyContract(
    contractAddressStr,
    isString(network) ? network : undefined,
  );
  
  console.log("[loadTokenSpaceMetadata] Contract data loading result:", {
    success: !isUndefined(contractData),
    hasContract: contractData?.contract ? true : false,
    abiLength: contractData?.abi?.length || 0
  });
  
  if (isUndefined(contractData)) {
    console.log("[loadTokenSpaceMetadata] Contract data undefined, returning default props");
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
      },
    };
  }
  const { contract, abi } = contractData;

  let pinnedCastId: string | null = "";
  let owningIdentities: string[] = [];
  let ownerId: string | null = null;
  let ownerIdType: OwnerType = "address";

  try {
    console.log("[loadTokenSpaceMetadata] Fetching token owner from Clanker API for:", contractAddressStr);
    const tokenOwner = await tokenRequestorFromContractAddress(contractAddressStr);
    console.log("[loadTokenSpaceMetadata] Clanker API result:", {
      ownerId: tokenOwner.ownerId,
      ownerIdType: tokenOwner.ownerIdType,
      hasClankerData: !!tokenOwner.clankerData,
      hasEmpireData: !!tokenOwner.empireData
    });
    
    ownerId = tokenOwner.ownerId || null;
    ownerIdType = tokenOwner.ownerIdType;
  } catch (error) {
    console.error("[loadTokenSpaceMetadata] Error fetching token owner:", error);
  }

  if (isNil(ownerId)) {
    try {
      console.log("[loadTokenSpaceMetadata] Falling back to contract owner lookup");
      const ownerData = await contractOwnerFromContract(
        contract,
        abi,
        contractAddressStr,
        isString(network) ? network : undefined,
      );
      console.log("[loadTokenSpaceMetadata] Contract owner lookup result:", ownerData);
      
      ownerId = ownerData.ownerId || null;
      ownerIdType = ownerData.ownerIdType;
    } catch (error) {
      console.error("[loadTokenSpaceMetadata] Error fetching contract owner:", error);
    }
  }

  if (isNil(ownerId)) {
    console.log("[loadTokenSpaceMetadata] No owner found for contract, returning partial props");
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
        contractAddressStr,
        pinnedCastId,
        owningIdentities,
      },
    };
  }
  
  console.log("[loadTokenSpaceMetadata] Owner found:", { ownerId, ownerIdType });

  // Check if the contract has a castHash function
  const hasCastHash = abi.some(item =>
    item.type === 'function' &&
    item.name === 'castHash'
  );

  if (hasCastHash) {
    try {
      pinnedCastId = (await contract.read.castHash()) as string;
    } catch (error) {
      console.error("Error reading castHash:", error);
    }
  }

  if (ownerIdType === "address") {
    owningIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
  } else {
    owningIdentities = await loadOwnedItentitiesForFid(ownerId);
  }
  // console.log("Debug - Contract Address before query:", contractAddressStr);
  // console.log("Debug - Network:", network);

  console.log("[loadTokenSpaceMetadata] Querying database for space registration:", {
    contractAddressStr,
    network: isString(network) ? network : "any"
  });
  
  let query = createSupabaseServerClient()
    .from("spaceRegistrations")
    .select(
      "spaceId, spaceName, contractAddress, network, identityPublicKey, fidRegistrations(fid)"
    )
    .eq("contractAddress", contractAddressStr);

  if (isString(network)) {
    query = query.eq("network", network);
  }

  const { data, error } = await query
    .order("timestamp", { ascending: true })
    .limit(1);
    
  if (error) {
    console.error("[loadTokenSpaceMetadata] Database query error:", error);
  }
  
  console.log("[loadTokenSpaceMetadata] Database query results:", {
    success: !error,
    resultCount: data?.length || 0,
    firstResult: data?.[0] ? {
      spaceId: data[0].spaceId,
      contractAddress: data[0].contractAddress,
      network: data[0].network
    } : null
  });

  const registrationRow = data?.[0];
  const spaceId = registrationRow?.spaceId || undefined;
  const registeredFid = Array.isArray(registrationRow?.fidRegistrations)
    ? registrationRow?.fidRegistrations[0]?.fid
    : registrationRow?.fidRegistrations?.fid;
    
  console.log("[loadTokenSpaceMetadata] Extracted registration data:", {
    spaceId,
    registeredFid
  });

  if (registrationRow?.identityPublicKey) {
    if (!owningIdentities.includes(registrationRow.identityPublicKey)) {
      owningIdentities.push(registrationRow.identityPublicKey);
    }
  }

  if (!isNil(registeredFid)) {
    ownerId = String(registeredFid);
    ownerIdType = "fid";
  }

  return {
    props: {
      spaceId,
      ownerId,
      ownerIdType,
      tabName,
      contractAddress: contractAddressStr,
      pinnedCastId,
      owningIdentities,
    },
  };
}

// Token space specific creator
export const createTokenSpaceData = (
  spaceId: string | undefined,
  spaceName: string,
  contractAddress: string,
  network: EtherScanChainName,
  ownerId: string | null,
  ownerIdType: OwnerType,
  tokenData: MasterToken | undefined,
  tabName: string
): Omit<TokenSpaceData, 'isEditable' | 'spacePageUrl'> => {
  const ownerAddress = ownerId && ownerIdType === "address" ? ownerId as Address : "0x0000000000000000000000000000000000000000" as Address;
  
  console.log("[createTokenSpaceData] Creating default config");
  
  // Get symbol from tokenData for the config
  const symbol = tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";
  const castHash = tokenData?.clankerData?.cast_hash || "";
  const casterFid = String(tokenData?.clankerData?.requestor_fid || "");
  const isClankerToken = !!tokenData?.clankerData;
  
  // Use the createInitialTokenSpaceConfigForAddress function to create the config
  const config = {
    ...createInitialTokenSpaceConfigForAddress(
      contractAddress,
      castHash,
      casterFid,
      symbol,
      isClankerToken,
      network
    ),
    timestamp: new Date().toISOString(),
  };

  return {
    // Base SpaceData properties
    id: spaceId,
    spaceName,
    spaceType: SPACE_TYPES.TOKEN,
    updatedAt: new Date().toISOString(),
    defaultTab: "Token",
    config,
    // TokenSpaceData specific properties
    contractAddress,
    network,
    ownerAddress,
    tokenData,
  };
};

export const loadTokenSpaceData = async (
  params: Record<string, string | string[]>,
  tabNameParam?: string
): Promise<Omit<TokenSpaceData, 'isEditable' | 'spacePageUrl'> | null> => {
  const spaceMetadata = await loadTokenSpaceMetadata(params);
  
  if (!spaceMetadata.props.contractAddress) {
    return null;
  }

  const { contractAddress, ownerId, ownerIdType } = spaceMetadata.props;
  const network = (params.network as string) || "base";
  const tabName = tabNameParam || spaceMetadata.props.tabName || "Token";
  const spaceName = `Token ${contractAddress}`;

  // Use spaceId from database if available
  const spaceId: string | undefined = spaceMetadata.props.spaceId;

  // Load token data
  const tokenData = await loadTokenData(contractAddress as Address, network as EtherScanChainName);

  return createTokenSpaceData(
    spaceId, // Use server-side checked spaceId
    spaceName,
    contractAddress,
    network as EtherScanChainName,
    ownerId,
    ownerIdType,
    tokenData,
    tabName
  );
};

import { first, isArray, isNil, isString, isUndefined } from "lodash";
import {
  contractOwnerFromContract,
  loadViemViewOnlyContract,
  OwnerType,
} from "../api/etherscan";
import {
  loadOwnedItentitiesForFid,
  loadOwnedItentitiesForWalletAddress,
} from "../database/supabase/serverHelpers";
import createSupabaseServerClient from "../database/supabase/clients/server";
import { string } from "prop-types";
import type { EtherScanChainName } from "@/constants/etherscanChainIds";
import { unstable_noStore as noStore } from 'next/cache';
const ETH_CONTRACT_ADDRESS_REGEX = new RegExp(/^0x[a-fA-F0-9]{40}$/);

const defaultContractPageProps = {
  spaceId: null,
  ownerId: null,
  ownerIdType: "address" as OwnerType,
  tabName: "Profile",
  contractAddress: null,
  owningIdentities: [],
  network: string,
};

export async function loadContractData(
  params:  Record<string, string | string[]>,
) {

  noStore();
  if (isUndefined(params)) {
    return {
      props: defaultContractPageProps,
    };
  }

  const { contractAddress, tabName: tabNameUnparsed, network } = params;
  // console.log("contractPageProps network", network);
  const tabName = isString(tabNameUnparsed) ? tabNameUnparsed : "Profile";
  if (
    isNil(contractAddress) ||
    isArray(contractAddress) ||
    !ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress)
  ) {
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
      },
    };
  }
  // console.log("network contractPageProps", network);

  const contractData = await loadViemViewOnlyContract(
    contractAddress,
    isString(network) ? network : undefined,
  );
  if (isUndefined(contractData)) {
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
    const ownerData = await contractOwnerFromContract(
      contract,
      abi,
      contractAddress,
      isString(network) ? network : undefined,
    );
    ownerId = ownerData.ownerId || null;
    ownerIdType = ownerData.ownerIdType;
  } catch (error) {
    console.error("Error fetching contract owner:", error);
  }

  if (isNil(ownerId)) {
    console.warn("No owner found for contract - will still attempt space lookup", {
      contractAddress,
      network,
    });
    // Continue with space lookup even without ownerId
  }

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

  if (ownerIdType === "address" && ownerId) {
    owningIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
  } else if (ownerId) {
    owningIdentities = await loadOwnedItentitiesForFid(ownerId);
  }
  // console.log("Debug - Contract Address before query:", contractAddress);
  // console.log("Debug - Network:", network);

  let query = createSupabaseServerClient()
    .from("spaceRegistrations")
    .select("spaceId, spaceName, contractAddress, network")
    .eq("contractAddress", contractAddress);

  if (isString(network)) {
    query = query.eq("network", network);
  }

  const { data, error } = await query
    .order("timestamp", { ascending: true })
    .limit(1);

  let spaceId = data?.[0]?.spaceId || null;

  // If no spaceId found, log details but don't attempt registration here
  // The UI/store will handle registration using the proper signed request flow
  if (!spaceId) {
    console.warn("No contract space found in DB. Registration will be handled by the UI/store.", {
      contractAddress,
      network,
      ownerId,
      ownerIdType,
    });
  }

  // Don't return an error if spaceId is null - let the UI handle registration
  if (!spaceId) {
    console.log("[contractPagePropsLoader] No spaceId found, will be registered by UI/store:", {
      contractAddress,
      network,
      ownerId,
      ownerIdType,
    });
  }

  return {
    props: {
      spaceId,
      ownerId,
      ownerIdType,
      tabName,
      contractAddress,
      pinnedCastId,
      owningIdentities,
      network, // Include network in the response
    },
  };
}

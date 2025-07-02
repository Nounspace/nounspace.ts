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
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
        contractAddress,
        pinnedCastId,
        owningIdentities,
      },
    };
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

  if (ownerIdType === "address") {
    owningIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
  } else {
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

  const { data } = await query
    .order("timestamp", { ascending: true })
    .limit(1);

  let spaceId = data?.[0]?.spaceId || null;

  // Fallback to legacy registrations without a network value
  if (!spaceId && isString(network)) {
    const { data: legacyData } = await createSupabaseServerClient()
      .from("spaceRegistrations")
      .select("spaceId")
      .eq("contractAddress", contractAddress)
      .is("network", null)
      .order("timestamp", { ascending: true })
      .limit(1);
    spaceId = legacyData?.[0]?.spaceId || null;
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
    },
  };
}

import { isNil, isString, isUndefined } from "lodash";
import {
  contractOwnerFromContract,
  loadViemViewOnlyContract,
  OwnerType,
} from "../api/etherscan";
import {
  loadOwnedItentitiesForFid,
  loadOwnedItentitiesForWalletAddress,
} from "../database/supabase/serverHelpers";
import { tokenRequestorFromContractAddress } from "../queries/clanker";
import { createSupabaseServerClient } from "../database/supabase/clients/server";
import { unstable_noStore as noStore } from 'next/cache';
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

export async function loadContractData(
  params: Record<string, string | string[]>,
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
    Array.isArray(contractAddress) ||
    !ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress)
  ) {
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
      },
    };
  }
  const contractAddressStr = contractAddress as string;
  // console.log("network contractPageProps", network);

  const contractData = await loadViemViewOnlyContract(
    contractAddressStr,
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
      const tokenOwner = await tokenRequestorFromContractAddress(contractAddressStr);
    ownerId = tokenOwner.ownerId || null;
    ownerIdType = tokenOwner.ownerIdType;
  } catch (error) {
    console.error("Error fetching token owner:", error);
  }

  if (isNil(ownerId)) {
    try {
      const ownerData = await contractOwnerFromContract(
        contract,
        abi,
        contractAddressStr,
        isString(network) ? network : undefined,
      );
      ownerId = ownerData.ownerId || null;
      ownerIdType = ownerData.ownerIdType;
    } catch (error) {
      console.error("Error fetching contract owner:", error);
    }
  }

  if (isNil(ownerId)) {
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

  let query = createSupabaseServerClient()
    .from("spaceRegistrations")
    .select(
      "spaceId, spaceName, contractAddress, network, identityPublicKey, fidRegistrations(fid)"
    )
    .eq("contractAddress", contractAddressStr);

  if (isString(network)) {
    query = query.eq("network", network);
  }

  const { data } = await query
    .order("timestamp", { ascending: true })
    .limit(1);

  const registrationRow = data?.[0];
  const spaceId = registrationRow?.spaceId || undefined;
  const registeredFid = Array.isArray(registrationRow?.fidRegistrations)
    ? registrationRow?.fidRegistrations[0]?.fid
    : registrationRow?.fidRegistrations?.fid;

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

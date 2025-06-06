import { first, isArray, isNil, isString, isUndefined } from "lodash";
import {
  contractOwnerFromContract,
  loadEthersViewOnlyContract,
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
  const networkStr = isString(network) ? network : Array.isArray(network) ? network[0] : "";
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

  const contract = await loadEthersViewOnlyContract(
    contractAddress,
    networkStr,
  );
  if (isUndefined(contract)) {
    return {
      props: {
        ...defaultContractPageProps,
        tabName,
      },
    };
  }
  const abi = contract.interface;

  let pinnedCastId: string | null = "";
  let owningIdentities: string[] = [];
  let ownerId: string | null = null;
  let ownerIdType: OwnerType = "address";
  try {
    const ownerData = await contractOwnerFromContract(
      contract,
      String(network),
    );
    ownerId = ownerData.ownerId;
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

  if (abi.hasFunction("castHash")) {
    pinnedCastId = (await contract.castHash()) as string;
  }

  if (ownerIdType === "address") {
    owningIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
  } else {
    owningIdentities = await loadOwnedItentitiesForFid(Number(ownerId));
  }
  // console.log("Debug - Contract Address before query:", contractAddress);
  // console.log("Debug - Network:", network);

  const { data, error } = await createSupabaseServerClient()
    .from("spaceRegistrations")
    .select("spaceId, spaceName, contractAddress, network")
    .eq("contractAddress", contractAddress)
    .eq("network", networkStr)
    .order("timestamp", { ascending: true })
    .limit(1)
  
  // console.log("Debug - Database Query Error:", error);
  // console.log("Debug - Raw Query Results:", data);
  // console.log("Debug - First Space ID:", data?.[0]?.spaceId);
  // console.log("Debug - Query Details:", {
  //   contractAddress,
  //   network,
  //   error: error?.message,
  // });
  
  const spaceId = data?.[0]?.spaceId || null;

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

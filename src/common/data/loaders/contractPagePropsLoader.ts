import { GetServerSidePropsContext } from "next";
import { first, isArray, isNil, isString, isUndefined } from "lodash";
import {
  contractOwnerFromContract,
  loadEthersViewOnlyContract,
  OwnerType,
} from "../api/etherscan";
import { loadOnwingIdentitiesForAddress } from "../database/supabase/serverHelpers";
import supabaseClient from "../database/supabase/clients/server";

const ETH_CONTRACT_ADDRESS_REGEX = new RegExp(/^0x[a-fA-F0-9]{40}$/);

export async function loadContractData(
  params: GetServerSidePropsContext["params"],
) {
  if (isUndefined(params)) {
    return {
      props: {
        spaceId: null,
        ownerId: null,
        ownerIdType: "address" as OwnerType,
        tabName: null,
        contractAddress: null,
        owningIdentities: [],
      },
    };
  }

  const { contractAddress, tabName: tabNameUnparsed } = params;
  const tabName = isString(tabNameUnparsed) ? tabNameUnparsed : null;
  if (
    isNil(contractAddress) ||
    isArray(contractAddress) ||
    !ETH_CONTRACT_ADDRESS_REGEX.test(contractAddress)
  ) {
    return {
      props: {
        spaceId: null,
        ownerId: null,
        ownerIdType: "address" as OwnerType,
        tabName,
        contractAddress: null,
        owningIdentities: [],
      },
    };
  }

  const contract = await loadEthersViewOnlyContract(contractAddress);
  if (isUndefined(contract)) {
    return {
      props: {
        spaceId: null,
        ownerId: null,
        ownerIdType: "address" as OwnerType,
        tabName,
        contractAddress: null,
        owningIdentities: [],
      },
    };
  }
  const abi = contract.interface;

  let pinnedCastId: string | undefined;
  let owningIdentities: string[] = [];
  const { ownerId, ownerIdType } = await contractOwnerFromContract(contract);

  if (abi.hasFunction("castHash")) {
    pinnedCastId = (await contract.castHash()) as string;
  }

  if (ownerIdType === "address" && !isNil(ownerId)) {
    owningIdentities = await loadOnwingIdentitiesForAddress(ownerId);
  }

  if (isNil(ownerId)) {
    return {
      props: {
        spaceId: null,
        ownerId: null,
        ownerIdType: "address" as OwnerType,
        tabName,
        contractAddress,
        pinnedCastId,
        owningIdentities,
      },
    };
  }

  let spaceId: string | null = null;

  if (ownerIdType === "fid") {
    const { data } = await supabaseClient
      .from("spaceRegistrations")
      .select("spaceId, spaceName")
      .eq("fid", ownerId);
    spaceId = first(data)?.spaceId || null;
  } else {
    const { data } = await supabaseClient
      .from("spaceRegistrations")
      .select("spaceId, spaceName")
      .eq("contractAddress", ownerId);
    spaceId = first(data)?.spaceId || null;
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

import { GetServerSidePropsContext } from "next";
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
import supabaseClient from "../database/supabase/clients/server";
import { string } from "prop-types";

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
  params: GetServerSidePropsContext["params"],
) {
  if (isUndefined(params)) {
    return {
      props: defaultContractPageProps,
    };
  }

  const { contractAddress, tabName: tabNameUnparsed, network } = params;
  console.log("contractPageProps network", network);
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

  const contract = await loadEthersViewOnlyContract(contractAddress, String(network));
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
  const { ownerId, ownerIdType } = await contractOwnerFromContract(contract, String(network));

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
    owningIdentities = await loadOwnedItentitiesForFid(ownerId);
  }
  console.log(owningIdentities);

  const { data } = await supabaseClient
    .from("spaceRegistrations")
    .select("spaceId, spaceName")
    .eq("contractAddress", contractAddress);
  const spaceId = first(data)?.spaceId || null;

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

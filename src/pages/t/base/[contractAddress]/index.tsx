import ContractDefinedSpace from "@/common/components/pages/ContractDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import {
  baseProvider,
  contractOwnerFromContract,
  loadEthersContract,
  OwnerType,
} from "@/common/data/api/ethers";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { loadOnwingIdentitiesForAddress } from "@/common/data/database/supabase/serverHelpers";
import { useAppStore } from "@/common/data/stores/app";
import { generateContractMetadataHtml } from "@/common/lib/utils/generateContractMetadataHtml";
import { NextPageWithLayout } from "@/pages/_app";
import { first, isArray, isNil, isString, isUndefined } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import React, { useEffect } from "react";

export interface ContractSpacePageProps {
  spaceId: string | null;
  tabName: string | null;
  contractAddress: string | null;
  ownerIdType: OwnerType;
  pinnedCastId?: string;
  owningIdentities: string[];
  ownerId: string | null;
}

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

  const contract = await loadEthersContract(baseProvider, contractAddress);
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

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  return loadContractData(params);
}) satisfies GetServerSideProps<ContractSpacePageProps>;

export const ContractPrimarySpace: NextPageWithLayout = ({
  spaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
}: ContractSpacePageProps) => {
  const { loadEditableSpaces, addContractEditableSpaces } = useAppStore(
    (state) => ({
      loadEditableSpaces: state.space.loadEditableSpaces,
      addContractEditableSpaces: state.space.addContractEditableSpaces,
    }),
  );

  useEffect(() => {
    if (spaceId) addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (!isNil(ownerId) && !isNil(contractAddress)) {
    if (
      (isNil(spaceId) && tabName === "profile") ||
      tabName === null ||
      !isNil(spaceId)
    )
      return (
        <>
          <Head>{generateContractMetadataHtml(contractAddress)}</Head>
          <ContractDefinedSpace
            ownerId={ownerId}
            ownerIdType={ownerIdType}
            spaceId={spaceId}
            tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
            contractAddress={contractAddress}
          />
        </>
      );
  }

  return <SpaceNotFound />;
};

export default ContractDefinedSpace;

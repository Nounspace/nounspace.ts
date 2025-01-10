import ContractDefinedSpace from "@/common/components/pages/ContractDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { useAppStore } from "@/common/data/stores/app";
import { generateContractMetadataHtml } from "@/common/lib/utils/generateContractMetadataHtml";
import { NextPageWithLayout } from "@/pages/_app";
import { isArray, isNil } from "lodash";
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

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  const data = await loadContractData(params);

  // Ensure pinnedCastId is either null or omitted if undefined
  if (data.props.pinnedCastId === undefined) {
    delete data.props.pinnedCastId;
  }

  return data;
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
    addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  // Hardcoded rule for specific contractAddress and user
  if (
    contractAddress === "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab" &&
    owningIdentities.includes("527313")
  ) {
    console.log("Hardcoded rule applied: setting ownerId to 527313");
    ownerId = "0x06AE622bF2029Db79Bdebd38F723f1f33f95F6C5";
    ownerIdType = "address";
  }

  console.log("ownerId:", ownerId);
  console.log("ownerIdType:", ownerIdType);

  if (!isNil(ownerId) && !isNil(contractAddress)) {
    if (
      (isNil(spaceId) && (tabName === "Profile" || tabName === null)) ||
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

export default ContractPrimarySpace;

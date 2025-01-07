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
import React, { useEffect, useState } from "react";

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
    addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (!isNil(ownerId) && !isNil(contractAddress)) {
    if (
      (isNil(spaceId) && (tabName === "profile" || tabName === null)) ||
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

'use client'

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
import {
  MasterToken,
  TokenProvider,
  useToken,
} from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";

export interface ContractSpacePageProps {
  spaceId: string | null;
  tabName: string | null;
  contractAddress: string | null;
  ownerIdType: OwnerType;
  pinnedCastId?: string;
  owningIdentities: string[];
  ownerId: string | null;
  tokenData?: MasterToken;
  network: EtherScanChainName;
}

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  const contractData = await loadContractData(params);
  const network = params?.network as EtherScanChainName;
  return {
    props: {
      ...contractData.props,
      network,
    },
  };
}) satisfies GetServerSideProps<ContractSpacePageProps>;

export const ContractPrimarySpace: NextPageWithLayout = ({
  spaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
}: ContractSpacePageProps) => {
  return (
    <TokenProvider
      contractAddress={contractAddress as Address}
      network={network}
    >
      <ContractPrimarySpaceContent
        spaceId={spaceId}
        tabName={tabName}
        ownerId={ownerId}
        ownerIdType={ownerIdType}
        contractAddress={contractAddress}
        owningIdentities={owningIdentities}
        network={network}
      />
    </TokenProvider>
  );
};

export const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
  spaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
}) => {
  const { loadEditableSpaces, addContractEditableSpaces } = useAppStore(
    (state) => ({
      loadEditableSpaces: state.space.loadEditableSpaces,
      addContractEditableSpaces: state.space.addContractEditableSpaces,
    }),
  );

  const { tokenData } = useToken();

  useEffect(() => {
    addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    loadEditableSpaces();
  }, []);

  if (!isNil(ownerId) && !isNil(contractAddress)) {
    if (
      (isNil(spaceId) &&
        (tabName?.toLocaleLowerCase() === "profile" || tabName === null)) ||
      !isNil(spaceId)
    )
      return (
        <>
          <Head>
            {generateContractMetadataHtml(contractAddress, tokenData)}
          </Head>
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

import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import React from "react";
import {
  fetchMasterToken,
  MasterToken,
  TokenProvider,
} from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { Metadata } from "next/types";
import { generateContractMetadataHtml } from "@/common/lib/utils/generateContractMetadataHtml";
import ContractPrimarySpaceContent from "../ContractPrimarySpaceContent";

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

export async function generateMetadata({
  params: { contractAddress, network },
}): Promise<Metadata> {
  const tokenResponse = await fetchMasterToken(
    contractAddress,
    network as EtherScanChainName
  );

  const metadata = generateContractMetadataHtml(contractAddress, tokenResponse);
  return metadata;
}

export default async function ContractPrimarySpace({ params }) {
  const {
    props: {
      spaceId,
      tabName,
      ownerId,
      ownerIdType,
      contractAddress,
      owningIdentities,
    },
  } = await loadContractData(params || {});
  const network = params?.network as EtherScanChainName;

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
}

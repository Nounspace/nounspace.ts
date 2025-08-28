import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import React from "react";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
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

export default async function ContractPrimarySpace({ params }) {
  const resolvedParams = await params;
  const {
    props: {
      spaceId,
      tabName,
      ownerId,
      ownerIdType,
      contractAddress,
      owningIdentities,
    },
  } = await loadContractData(resolvedParams || {});
  const network = resolvedParams?.network as EtherScanChainName;
  const contractAddressStr = contractAddress as string | null;

  return (
      <TokenProvider
        contractAddress={contractAddressStr as Address}
        network={network}
      >
        <ContractPrimarySpaceContent
          spaceId={spaceId}
          tabName={tabName}
          ownerId={ownerId}
          ownerIdType={ownerIdType}
          contractAddress={contractAddressStr}
          owningIdentities={owningIdentities}
          network={network}
        />
      </TokenProvider>
  );
}

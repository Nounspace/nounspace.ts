import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import React from "react";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import ContractPrimarySpaceContent from "../ContractPrimarySpaceContent";
import { getSpaceTabConfig } from "./utils";
import { SpaceConfig } from "@/app/(spaces)/Space";

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
  initialConfig?: Omit<SpaceConfig, "isEditable">;
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
  let initialConfig: Omit<SpaceConfig, "isEditable"> | undefined = undefined;
  if (spaceId) {
    const config = await getSpaceTabConfig(spaceId, tabName ?? "Profile");
    if (config) {
      initialConfig = config;
    }
  }

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
        initialConfig={initialConfig}
      />
    </TokenProvider>
  );
}

import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import React from "react";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { fetchEmpireByAddress } from "@/common/data/queries/empireBuilder";
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

async function loadTokenData(
  contractAddress: Address,
  network: EtherScanChainName
): Promise<MasterToken | undefined> {
  try {
    const [tokenResponse, clankerResponse, empireResponse] = await Promise.all([
      fetchTokenData(contractAddress, null, network),
      network === "base" ? fetchClankerByAddress(contractAddress) : Promise.resolve(null),
      fetchEmpireByAddress(contractAddress),
    ]);

    return {
      network,
      geckoData: tokenResponse,
      clankerData: clankerResponse,
      empireData: empireResponse,
    };
  } catch (error) {
    console.error("Failed to load token data:", error);
    return undefined;
  }
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

  // Guard against null/undefined contractAddress
  if (!contractAddressStr) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Contract Not Found</h1>
          <p className="text-gray-600">The specified contract address is invalid or missing.</p>
        </div>
      </div>
    );
  }

  // Perform server-side token data lookup
  const defaultTokenData = await loadTokenData(contractAddressStr as Address, network);

  return (
      <TokenProvider
        contractAddress={contractAddressStr as Address}
        network={network}
        defaultTokenData={defaultTokenData}
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

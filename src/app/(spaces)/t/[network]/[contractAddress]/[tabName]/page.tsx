export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { fetchEmpireByAddress } from "@/common/data/queries/empireBuilder";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import ContractPrimarySpaceContent from "../../ContractPrimarySpaceContent";

async function loadTokenData(
  contractAddress: Address,
  network: EtherScanChainName
): Promise<MasterToken> {
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
}

export default async function WrappedContractPrimarySpace({ params }) {
  const resolvedParams = await params;
  const contractAddress = resolvedParams?.contractAddress as string;
  const contractData = await loadContractData(resolvedParams || {});
  const network = resolvedParams?.network as EtherScanChainName;
  const tokenData = await loadTokenData(contractAddress as Address, network);

  const props = {
    ...contractData.props,
    contractAddress,
    tokenData,
    network,
  };

  return (
    <TokenProvider
      contractAddress={contractAddress as Address}
      defaultTokenData={tokenData}
      network={network}
    >
      <ContractPrimarySpaceContent {...props} />
    </TokenProvider>
  );
}

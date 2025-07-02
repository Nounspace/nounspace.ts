export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import ContractPrimarySpaceContent from "../../ContractPrimarySpaceContent";
import { getSpaceTabConfig } from "../utils";
import { SpaceConfig } from "@/app/(spaces)/Space";

async function loadTokenData(
  contractAddress: Address,
  network: EtherScanChainName
): Promise<MasterToken> {
  if (network === "base") {
    const [tokenResponse, clankerResponse] = await Promise.all([
      fetchTokenData(contractAddress, null, network),
      fetchClankerByAddress(contractAddress),
    ]);

    return {
      network,
      geckoData: tokenResponse,
      clankerData: clankerResponse,
    };
  } else {
    const tokenResponse = await fetchTokenData(contractAddress, null, network);
    return {
      network,
      geckoData: tokenResponse,
      clankerData: null,
    };
  }
}

export default async function WrappedContractPrimarySpace({ params }) {
  const contractAddress = params?.contractAddress as string;
  const contractData = await loadContractData(params || {});
  const network = params?.network as EtherScanChainName;
  const tokenData = await loadTokenData(contractAddress as Address, network);

  let initialConfig: Omit<SpaceConfig, "isEditable"> | undefined = undefined;
  const spaceId = contractData.props.spaceId;
  const tabName = contractData.props.tabName ?? "Profile";
  if (spaceId) {
    const config = await getSpaceTabConfig(spaceId, tabName);
    if (config) {
      initialConfig = config;
    }
  }

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
      <ContractPrimarySpaceContent {...props} initialConfig={initialConfig} />
    </TokenProvider>
  );
}

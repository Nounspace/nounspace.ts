import { loadTokenSpaceData } from "./utils";
import React from "react";
import { TokenProvider } from "@/common/providers/TokenProvider";
import TokenSpace from "./TokenSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";

export default async function ContractPrimarySpace({ 
  params 
}: {
  params: Promise<{ network: string; contractAddress: string; tabName?: string }>
}) {
  const { network: networkParam, contractAddress: contractAddressParam, tabName: tabNameParam } = await params;
  const resolvedParams = { network: networkParam, contractAddress: contractAddressParam };
  
  // Handle tabName parameter (decode if needed)
  let decodedTabNameParam = tabNameParam;
  if (tabNameParam) {
    decodedTabNameParam = decodeURIComponent(tabNameParam);
  }

  // Load token space data
  const tokenSpaceData = await loadTokenSpaceData(resolvedParams, decodedTabNameParam);

  // Guard against null/undefined tokenSpaceData
  if (!tokenSpaceData) {
    return (
      <SpaceNotFound />
    );
  }

  const finalTabName = decodedTabNameParam || tokenSpaceData.config.tabNames?.[0] || "Token";

  return (
      <TokenProvider
        contractAddress={tokenSpaceData.contractAddress as `0x${string}`}
        network={tokenSpaceData.network as any}
        defaultTokenData={tokenSpaceData.tokenData}
      >
        <TokenSpace
          spaceData={tokenSpaceData}
          tabName={finalTabName}
        />
      </TokenProvider>
  );
}

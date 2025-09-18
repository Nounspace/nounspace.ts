"use client";

import React, { useMemo } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { Address } from 'viem';
import { TokenSpaceData } from "@/common/types/space";
import { SPACE_TYPES } from "@/common/constants/spaceTypes";

export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress,
        tokenData?.clankerData?.cast_hash || "",
        String(tokenData?.clankerData?.requestor_fid || ""),
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
        !!tokenData?.clankerData,
        tokenData?.network,
      ),
    [contractAddress, tokenData, tokenData?.network],
  );

  const getSpacePageUrl = (tabName: string) =>
    `/t/${tokenData?.network}/${contractAddress}/${tabName}`;


  // Convert ownerId to the appropriate type based on ownerIdType
  const spaceOwnerFid = ownerIdType === 'fid' ? Number(ownerId) : undefined;
  const spaceOwnerAddress = ownerIdType === 'address' ? ownerId as Address : undefined;
  
  // Ensure we have a valid owner address
  if (!spaceOwnerAddress) {
    console.error("Missing required ownerAddress for token space");
    return null;
  }

  // Create a properly typed TokenSpace object
  const tokenSpace: TokenSpaceData = {
    id: spaceId || `temp-token-${contractAddress}-${tokenData?.network || undefined}`,
    spaceName: tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || contractAddress,
    spaceType: SPACE_TYPES.TOKEN,
    updatedAt: new Date().toISOString(),
    contractAddress: contractAddress,
    network: tokenData?.network || 'mainnet',
    ownerAddress: spaceOwnerAddress,
    tokenData: tokenData || undefined,
    config: INITIAL_SPACE_CONFIG
  };

  return (
    <PublicSpace
      spaceData={tokenSpace}
      tabName={tabName}
      getSpacePageUrl={getSpacePageUrl}
    />
  );
}
"use client";

import React, { useMemo } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { OwnerType } from "@/common/data/api/etherscan";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { Address, isAddressEqual } from 'viem';
import { TokenSpaceData, SPACE_TYPES } from "@/common/types/space";
import { isNil } from "lodash";

export interface TokenSpaceProps {
  spaceId?: string;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
}

// Editability logic for token spaces
const checkTokenSpaceEditability = (
  ownerAddress: Address,
  tokenData: any | undefined,
  currentUserFid: number | undefined,
  wallets: { address: Address }[]
): boolean => {
  // Check if user is the owner by FID (from tokenData)
  if (
    tokenData?.clankerData?.requestor_fid && 
    !isNil(currentUserFid) && 
    currentUserFid === Number(tokenData.clankerData.requestor_fid)
  ) {
    return true;
  }

  // Check if user owns the wallet address - handles both direct contract ownership
  // and Empire token ownership through tokenData.empireData.owner
  const actualOwnerAddress = ownerAddress || (tokenData?.empireData?.owner as Address | undefined);
  if (
    actualOwnerAddress &&
    wallets.some((w) => isAddressEqual(w.address as Address, actualOwnerAddress))
  ) {
    return true;
  }

  return false;
};

export default function TokenSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: TokenSpaceProps) {
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
    spacePageUrl: getSpacePageUrl,
    isEditable: (currentUserFid: number | undefined, wallets: { address: Address }[] = []) => 
      checkTokenSpaceEditability(spaceOwnerAddress, tokenData, currentUserFid, wallets),
    config: INITIAL_SPACE_CONFIG
  };

  return (
    <PublicSpace
      spaceData={tokenSpace}
      tabName={tabName}
    />
  );
}
"use client";

import React, { useMemo } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { Address, isAddressEqual } from 'viem';
import { TokenSpaceData } from "@/common/types/spaceData";
import { isNil } from "lodash";

export interface TokenSpaceProps {
  spaceData: Omit<TokenSpaceData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
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
  const resolvedOwnerAddress = ownerAddress || (tokenData?.empireData?.owner as Address | undefined);
  if (
    resolvedOwnerAddress &&
    wallets.some((w) => isAddressEqual(w.address as Address, resolvedOwnerAddress))
  ) {
    return true;
  }

  return false;
};

export default function TokenSpace({
  spaceData,
  tabName,
}: TokenSpaceProps) {
  const { tokenData } = useToken();

  // Use the passed-in spaceData, but update it with current tokenData from context and add isEditable and spacePageUrl
  const updatedSpaceData: TokenSpaceData = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/t/${spaceData.network}/${spaceData.contractAddress}/${encodeURIComponent(tabName)}`,
    tokenData: tokenData || spaceData.tokenData,
    isEditable: (currentUserFid: number | undefined, wallets?: { address: Address }[]) => 
      checkTokenSpaceEditability(
        spaceData.ownerAddress, 
        tokenData || spaceData.tokenData, 
        currentUserFid, 
        wallets || []
      ),
  }), [spaceData, tokenData]);

  return (
    <PublicSpace
      spaceData={updatedSpaceData}
      tabName={tabName}
    />
  );
}
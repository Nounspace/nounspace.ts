"use client";

/**
 * TokenSpace Component
 * 
 * Client-side space component for token/contract spaces in the public spaces pattern.
 * 
 * Responsibilities:
 * - Accepts server-side loaded token data (Omit<TokenSpaceData, 'isEditable' | 'spacePageUrl'>)
 * - Adds client-side editability logic with complex ownership verification
 * - Integrates with TokenProvider for real-time token data updates
 * - Renders PublicSpace component with complete token space data
 * 
 * Data Flow:
 * 1. Receives serializable token data from server-side page component
 * 2. Adds isEditable function with multi-layered ownership checks
 * 3. Adds spacePageUrl function for tab navigation using network and contract address
 * 4. Updates tokenData from TokenProvider context if available
 * 5. Passes complete TokenSpaceData to PublicSpace for rendering
 * 
 * Editability Logic:
 * - User can edit if they are the token owner by FID (from clankerData.requestor_fid)
 * - User can edit if they own the wallet address (direct contract ownership or Empire token ownership)
 * - Supports both direct contract ownership and Empire token ownership patterns
 * - Uses address comparison with isAddressEqual for secure wallet matching
 * 
 * Part of: /t/[network]/[contractAddress] route structure
 * Integrates with: TokenProvider, PublicSpace
 */

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
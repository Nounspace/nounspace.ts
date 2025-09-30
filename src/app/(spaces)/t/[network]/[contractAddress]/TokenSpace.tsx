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
import { TokenSpacePageData } from "@/common/types/spaceData";
import { isNil } from "lodash";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";

export interface TokenSpaceProps {
  spacePageData: Omit<TokenSpacePageData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

// Editability logic for token spaces
const checkTokenSpaceEditability = (
  spaceOwnerFid: number | undefined,
  spaceOwnerAddress: Address,
  tokenData: any | undefined,
  currentUserFid: number | undefined,
  wallets: { address: Address }[],
  spaceId: string | undefined,
  spaceIdentityPublicKey?: string,
  currentUserIdentityPublicKey?: string
): boolean => {
  // Require user to be logged in (have an identity key)
  if (!currentUserIdentityPublicKey) {
    console.log('[TokenSpace] User not logged in - not editable');
    return false;
  }

  let isEditable = false;
  const checks = {
    databaseFid: false,
    walletOwnership: false,
    clankerRequestor: false,
    identityOwnership: false
  };

  // Check if user is the owner by FID (from database registration)
  if (
    spaceOwnerFid &&
    !isNil(currentUserFid) &&
    currentUserFid === spaceOwnerFid
  ) {
    isEditable = true;
    checks.databaseFid = true;
  }

  // Check if user owns the wallet address - handles both direct contract ownership
  // and Empire token ownership through tokenData.empireData.owner
  const ownerAddress = spaceOwnerAddress || (tokenData?.empireData?.owner as Address | undefined);
  if (
    !isEditable &&
    ownerAddress &&
    wallets.some((w) => isAddressEqual(w.address as Address, ownerAddress))
  ) {
    isEditable = true;
    checks.walletOwnership = true;
  }

  // Check Clanker requestor status
  if (
    !isEditable &&
    tokenData?.clankerData?.requestor_fid && 
    !isNil(currentUserFid) && 
    currentUserFid === Number(tokenData.clankerData.requestor_fid)
  ) {
    isEditable = true;
    checks.clankerRequestor = true;
  }

  // Check identity key ownership (only if space is registered)
  if (
    !isEditable &&
    spaceId &&
    spaceIdentityPublicKey &&
    spaceIdentityPublicKey === currentUserIdentityPublicKey
  ) {
    isEditable = true;
    checks.identityOwnership = true;
  }

  console.log('[TokenSpace] Editability check details:', {
    spaceOwnerFid,
    spaceOwnerAddress,
    currentUserFid,
    walletAddresses: wallets.map((w) => w.address),
    ownerAddress,
    clankerRequestorFid: tokenData?.clankerData?.requestor_fid,
    empireOwner: tokenData?.empireData?.owner,
    spaceId,
    spaceIdentityPublicKey,
    currentUserIdentityPublicKey,
    checks,
    isEditable,
    tokenData: {
      clankerData: tokenData?.clankerData,
      empireData: tokenData?.empireData,
      geckoData: tokenData?.geckoData,
      network: tokenData?.network
    }
  });

  return isEditable;
};

export default function TokenSpace({
  spacePageData: spaceData,
  tabName,
}: TokenSpaceProps) {
  const { tokenData } = useToken();
  const currentUserIdentityPublicKey = useCurrentSpaceIdentityPublicKey();
  
  // Use the passed-in spaceData, but update it with current tokenData from context and add isEditable and spacePageUrl
  const updatedSpaceData: TokenSpacePageData = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/t/${spaceData.network}/${spaceData.contractAddress}/${encodeURIComponent(tabName)}`,
    tokenData: tokenData || spaceData.tokenData,
    isEditable: (currentUserFid: number | undefined, wallets?: { address: Address }[]) => {
      return checkTokenSpaceEditability(
        spaceData.spaceOwnerFid,
        spaceData.spaceOwnerAddress, 
        tokenData || spaceData.tokenData, 
        currentUserFid, 
        wallets || [],
        spaceData.spaceId,
        spaceData.identityPublicKey,
        currentUserIdentityPublicKey
      );
    },
  }), [spaceData, tokenData, currentUserIdentityPublicKey]);

  return (
    <PublicSpace
      spaceId={updatedSpaceData.spaceId || null}
      tabName={tabName}
      initialConfig={updatedSpaceData.config}
      getSpacePageUrl={updatedSpaceData.spacePageUrl}
      spaceOwnerFid={updatedSpaceData.spaceOwnerFid}
      spaceOwnerAddress={updatedSpaceData.spaceOwnerAddress}
      tokenData={updatedSpaceData.tokenData}
      contractAddress={updatedSpaceData.contractAddress}
      pageType={updatedSpaceData.spaceType}
    />
  );
}
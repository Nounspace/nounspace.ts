"use client";

/**
 * ProposalSpace Component
 * 
 * Client-side space component for DAO proposal spaces in the public spaces pattern.
 * 
 * Responsibilities:
 * - Accepts server-side loaded proposal data (Omit<ProposalSpaceData, 'isEditable' | 'spacePageUrl'>)
 * - Adds client-side editability logic based on wallet address ownership
 * - Integrates with ProposalProvider for real-time proposal data updates
 * - Renders PublicSpace component with complete proposal space data
 * 
 * Data Flow:
 * 1. Receives serializable proposal data from server-side page component
 * 2. Adds isEditable function that checks if user owns the proposal creator's wallet
 * 3. Adds spacePageUrl function for tab navigation
 * 4. Updates proposalData from ProposalProvider context if available
 * 5. Passes complete ProposalSpaceData to PublicSpace for rendering
 * 
 * Editability Logic:
 * - User can edit if they own the wallet address that created the proposal
 * - Uses wallet address comparison (case-insensitive)
 * 
 * Part of: /p/[proposalId] route structure
 * Integrates with: ProposalProvider, PublicSpace
 */

import React, { useMemo } from "react";
import { Address } from "viem";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ProposalSpacePageData } from "@/common/types/spaceData";
import { useProposal } from "@/common/providers/ProposalProvider";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";

export interface ProposalSpaceProps {
  spaceData: Omit<ProposalSpacePageData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

// Helper function to check if proposal space is editable
const isProposalSpaceEditable = (
  ownerAddress: Address,
  currentUserFid: number | undefined,
  wallets: { address: Address }[],
  spaceId: string | undefined,
  spaceIdentityPublicKey?: string,
  currentUserIdentityPublicKey?: string
): boolean => {
  // Require user to be logged in (have an identity key)
  if (!currentUserIdentityPublicKey) {
    console.log('[ProposalSpace] User not logged in - not editable');
    return false;
  }

  // Check wallet ownership (original logic)
  const hasWalletOwnership = wallets?.some(
    (w) => w.address.toLowerCase() === ownerAddress.toLowerCase()
  ) || false;

  // Check identity key ownership (only if space is registered)
  const hasIdentityOwnership = !!(spaceId && spaceIdentityPublicKey && 
    spaceIdentityPublicKey === currentUserIdentityPublicKey);

  console.log('[ProposalSpace] Editability check details:', {
    ownerAddress,
    currentUserFid,
    walletAddresses: wallets?.map((w) => w.address),
    spaceId,
    spaceIdentityPublicKey,
    currentUserIdentityPublicKey,
    hasWalletOwnership,
    hasIdentityOwnership,
    isEditable: hasWalletOwnership || hasIdentityOwnership
  });

  return hasWalletOwnership || hasIdentityOwnership;
};

export default function ProposalSpace({
  spaceData,
  tabName,
}: ProposalSpaceProps) {
  const { proposalData } = useProposal();
  const currentUserIdentityPublicKey = useCurrentSpaceIdentityPublicKey();

  // Use the passed-in spaceData, but update it with current proposalData from context 
  // and add isEditable and spacePageUrl
  const updatedSpaceData: ProposalSpacePageData = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/p/${spaceData.proposalId}/${encodeURIComponent(tabName)}`,
    proposalData: proposalData || spaceData.proposalData,
    isEditable: (currentUserFid: number | undefined, wallets?: { address: Address }[]) =>
      isProposalSpaceEditable(
        spaceData.spaceOwnerAddress, 
        currentUserFid, 
        wallets || [],
        spaceData.spaceId,
        spaceData.identityPublicKey,
        currentUserIdentityPublicKey
      ),
  }), [spaceData, proposalData, currentUserIdentityPublicKey]);

  return (
    <PublicSpace
      spaceId={updatedSpaceData.spaceId || null}
      tabName={tabName}
      initialConfig={updatedSpaceData.config}
      getSpacePageUrl={updatedSpaceData.spacePageUrl}
      spaceOwnerFid={updatedSpaceData.spaceOwnerFid}
      spaceOwnerAddress={updatedSpaceData.spaceOwnerAddress}
      pageType={updatedSpaceData.spaceType}
    />
  );
}

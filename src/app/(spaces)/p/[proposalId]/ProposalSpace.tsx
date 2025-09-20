"use client";

import React, { useMemo } from "react";
import { Address } from "viem";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ProposalSpaceData } from "@/common/types/spaceData";
import { useProposal } from "@/common/providers/ProposalProvider";

export interface ProposalSpaceProps {
  spaceData: Omit<ProposalSpaceData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

// Helper function to check if proposal space is editable
const isProposalSpaceEditable = (
  ownerAddress: Address,
  currentUserFid: number | undefined,
  wallets?: { address: Address }[]
): boolean => {
  return wallets?.some(
    (w) => w.address.toLowerCase() === ownerAddress.toLowerCase()
  ) || false;
};

export default function ProposalSpace({
  spaceData,
  tabName,
}: ProposalSpaceProps) {
  const { proposalData } = useProposal();

  // Use the passed-in spaceData, but update it with current proposalData from context 
  // and add isEditable and spacePageUrl
  const updatedSpaceData: ProposalSpaceData = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/p/${spaceData.proposalId}/${encodeURIComponent(tabName)}`,
    proposalData: proposalData || spaceData.proposalData,
    isEditable: (currentUserFid: number | undefined, wallets?: { address: Address }[]) =>
      isProposalSpaceEditable(spaceData.ownerAddress, currentUserFid, wallets),
  }), [spaceData, proposalData]);

  return (
    <PublicSpace
      spaceData={updatedSpaceData}
      tabName={tabName}
    />
  );
}

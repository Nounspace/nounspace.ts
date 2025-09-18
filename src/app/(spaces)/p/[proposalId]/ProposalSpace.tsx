"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { Address } from "viem";
import createInitalProposalSpaceConfigForProposalId from "@/constants/initialProposalSpace";
import { ProposalData } from "./utils";
import { useFidFromAddress } from "@/common/data/queries/farcaster";
import { ProposalSpaceData, SPACE_TYPES } from "@/common/types/space";

export interface ProposalSpaceProps {
  tabName?: string;
  proposalId: string | null;
  proposalData: ProposalData;
  owningIdentities?: string[];
}

const ProposalSpace = ({
  tabName,
  proposalId,
  proposalData,
}: ProposalSpaceProps) => {
  const ownerId = proposalData?.proposer.id;
  const { data: ownerFid } = useFidFromAddress(ownerId);

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitalProposalSpaceConfigForProposalId(
        proposalId as Address,
        ownerId as Address,
        proposalData?.proposer.id as Address,
      ),
    [proposalId, proposalData],
  );

  const getSpacePageUrl = (tabName: string) => `/p/${proposalId}/${tabName}`;

  // Editability logic for proposal spaces
  const checkProposalSpaceEditability = (
    ownerAddress: Address,
    wallets: { address: Address }[]
  ): boolean => {
    return wallets.some(
      (w) => w.address.toLowerCase() === ownerAddress.toLowerCase()
    );
  };

  // Ensure we have a valid owner address
  if (!ownerId || ownerId === "0x0" || ownerId === "0x0000000000000000000000000000000000000000") {
    console.error("Missing or invalid ownerAddress for proposal space");
    return <SpaceNotFound />;
  }

  // Create a properly typed ProposalSpace object
  const proposalSpace: ProposalSpaceData = {
    id: undefined, // Will be set by PublicSpace through registration
    spaceName: `Proposal ${proposalId}`,
    spaceType: SPACE_TYPES.PROPOSAL,
    updatedAt: new Date().toISOString(),
    proposalId: proposalId || '',
    ownerAddress: ownerId as Address,
    spacePageUrl: getSpacePageUrl,
    isEditable: (currentUserFid: number | undefined, wallets: { address: Address }[] = []) => 
      checkProposalSpaceEditability(ownerId as Address, wallets),
    config: INITIAL_SPACE_CONFIG
  };

  return (
    <div className="w-full">
      <PublicSpace
        spaceData={proposalSpace}
        tabName={tabName || "Overview"}
      />
    </div>
  );
};

export default ProposalSpace;

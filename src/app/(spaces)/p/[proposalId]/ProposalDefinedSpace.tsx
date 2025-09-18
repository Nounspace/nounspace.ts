"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { Address } from "viem";
import createInitalProposalSpaceConfigForProposalId from "@/constants/initialProposalSpace";
import { useProposalContext } from "@/common/providers/ProposalProvider";
import { ProposalData } from "./utils";
import { useFidFromAddress } from "@/common/data/queries/farcaster";
import { ProposalSpaceData } from "@/common/types/space";
import { SPACE_TYPES } from "@/common/constants/spaceTypes";

export interface ProposalPageSpaceProps {
  spaceId?: string;
  tabName?: string;
  proposalId: string | null;
  proposalData?: ProposalData;
  owningIdentities?: string[];
}

const ProposalDefinedSpace = ({
  spaceId,
  tabName,
  proposalId,
}: ProposalPageSpaceProps) => {
  const { proposalData } = useProposalContext();
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

  // Ensure we have a valid owner address
  if (!ownerId) {
    console.error("Missing required ownerAddress for proposal space");
    return null;
  }

  // Create a properly typed ProposalSpace object
  const proposalSpace: ProposalSpaceData = {
    id: spaceId || `temp-proposal-${proposalId}`,
    spaceName: `Proposal ${proposalId}`,
    spaceType: SPACE_TYPES.PROPOSAL,
    updatedAt: new Date().toISOString(),
    proposalId: proposalId || '',
    ownerAddress: ownerId as Address,
    config: INITIAL_SPACE_CONFIG
  };

  return (
    <div className="w-full">
      <PublicSpace
        spaceData={proposalSpace}
        tabName={tabName || "Overview"}
        getSpacePageUrl={getSpacePageUrl}
      />
    </div>
  );
};

export default ProposalDefinedSpace;

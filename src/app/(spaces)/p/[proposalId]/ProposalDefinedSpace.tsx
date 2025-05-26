"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { Address } from "viem";
import createInitalProposalSpaceConfigForProposalId from "@/constants/initialProposalSpace";
import { useProposalContext } from "@/common/providers/ProposalProvider";

export interface ProposalPageSpaceProps {
  spaceId?: string | null;
  tabName?: string | null;
  proposalId: string | null;
  owningIdentities?: string[];
  proposerFid?: number | undefined | null;
}

const ProposalDefinedSpace = ({
  spaceId,
  tabName,
  proposalId,
  proposerFid,
}: ProposalPageSpaceProps) => {
  const { proposalData } = useProposalContext();
  const ownerId = proposalData?.proposer?.id;

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitalProposalSpaceConfigForProposalId(
        proposalId as Address,
        ownerId as Address,
        proposalData?.proposer?.id as Address
      ),
    [proposalId, ownerId, proposalData]
  );

  const getSpacePageUrl = (tabName: string) => `/p/${proposalId}/${tabName}`;

  return (
    <div className="w-full">
      <PublicSpace
        spaceId={proposalId || ""}
        tabName={tabName || "Profile"}
        initialConfig={INITIAL_SPACE_CONFIG}
        getSpacePageUrl={getSpacePageUrl}
        isTokenPage={false}
        spaceOwnerFid={proposerFid || 1}
        spaceOwnerAddress={ownerId}
        pageType="proposal"
      />
    </div>
  );
};

export default ProposalDefinedSpace;

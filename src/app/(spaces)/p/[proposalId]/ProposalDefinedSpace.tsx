"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { Address } from "viem";
import createInitalProposalSpaceConfigForProposalId from "@/constants/initialProposalSpace";
import { ProposalData } from "./[tabname]/page";

export interface ProposalPageSpaceProps {
  spaceId?: string | null;
  tabName?: string | null;
  proposalId: string | null;
  proposalData?: ProposalData;
  owningIdentities?: string[];
}

const ProposalDefinedSpace = ({
  spaceId,
  tabName,
  proposalId,
  proposalData,
}: ProposalPageSpaceProps) => {
  const ownerId = proposalData?.proposer.id;

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitalProposalSpaceConfigForProposalId(
        proposalId as Address,
        ownerId as Address
      ),
    [proposalId, proposalData]
  );

  const getSpacePageUrl = (tabName: string) => `/p/${proposalId}/${tabName}`;

  return (
    <div className="w-full">
      <PublicSpace
        spaceId={spaceId || ""} // Ensure spaceId is a string
        tabName={tabName || ""} // Ensure tabName is a string
        initialConfig={INITIAL_SPACE_CONFIG}
        getSpacePageUrl={getSpacePageUrl}
        isTokenPage={false}
        spaceOwnerFid={1}
        spaceOwnerAddress={ownerId}
        pageType="proposal"
      />
    </div>
  );
};

export default ProposalDefinedSpace;

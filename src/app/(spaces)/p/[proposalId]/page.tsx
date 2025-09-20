export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import ProposalSpace from "./ProposalSpace";
import { loadProposalData } from "./utils";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";

const loadProposalSpaceData = async (
  proposalId: string,
  tabNameParam?: string
) => {
  const proposalData = await loadProposalData(proposalId || "0");
  
  // Check if proposal data is valid (not the fallback with 0x0 address)
  if (!proposalData?.proposer?.id || proposalData.proposer.id === "0x0" || proposalData.proposer.id === "0x0000000000000000000000000000000000000000") {
    return {
      proposalData: null,
      proposalId,
      tabName: undefined,
    };
  }

  return {
    proposalData,
    proposalId,
    tabName: tabNameParam,
  };
};

const ProposalSpacePage = async ({
  params,
}: {
  params: Promise<{ proposalId: string; tabname?: string }>
}) => {
  const { proposalId, tabname: tabNameParam } = await params;

  if (!proposalId) {
    return <SpaceNotFound />;
  }

  let decodedTabNameParam = tabNameParam;
  if (tabNameParam) {
    decodedTabNameParam = decodeURIComponent(tabNameParam);
  }

  const { proposalData, tabName } = await loadProposalSpaceData(proposalId, decodedTabNameParam);

  if (!proposalData) {
    return <SpaceNotFound />;
  }

  return (
    <ProposalSpace
      proposalData={proposalData}
      proposalId={proposalId}
      tabName={tabName}
    />
  );
};

export default ProposalSpacePage;
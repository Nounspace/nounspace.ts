export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import { ProposalProvider } from "@/common/providers/ProposalProvider";
import ProposalPrimarySpaceContent from "../ProposalPrimarySpaceContent";
import { loadProposalData, loadProposalSpaceId } from "../utils";

export default async function WrapperProposalPrimarySpace({ params }) {
  const resolvedParams = await params;
  const proposalId = resolvedParams?.proposalId as string;
  const proposalData = await loadProposalData(proposalId || "0");
  const spaceId = await loadProposalSpaceId(proposalId || "0");

  const props = {
    proposalData,
    proposalId,
    spaceId,
    tabName: resolvedParams?.tabname,
  };

  return (
    <ProposalProvider
      proposalId={proposalId as Address}
      defaultProposalData={proposalData}
    >
      <ProposalPrimarySpaceContent {...props} />
    </ProposalProvider>
  );
}

export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import ProposalSpace from "../ProposalSpace";
import { loadProposalData } from "../utils";

export default async function WrapperProposalPrimarySpace({ params }) {
  const resolvedParams = await params;
  const proposalId = resolvedParams?.proposalId as string;
  const proposalData = await loadProposalData(proposalId || "0");

  const props = {
    proposalData,
    proposalId,
    tabName: resolvedParams?.tabname,
  };

  return <ProposalSpace {...props} />;
}

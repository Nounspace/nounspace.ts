export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import { ProposalProvider } from "@/common/providers/ProposalProvider";
import ProposalDefinedSpace from "../ProposalDefinedSpace";
import { loadProposalData } from "../utils";

export default async function WrapperProposalPrimarySpace({ params }) {
  const proposalId = params?.proposalId as string;
  const tabName = params?.tabname as string | undefined;
  const proposalData = await loadProposalData(proposalId || "0");

  const props = {
    ...proposalData,
    proposalId,
    tabName,
  };

  return (
    <ProposalProvider
      proposalId={proposalId as Address}
      defaultProposalData={proposalData}
    >
      <ProposalDefinedSpace {...props} />
    </ProposalProvider>
  );
}

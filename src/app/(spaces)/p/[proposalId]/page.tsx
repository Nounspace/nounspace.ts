export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { loadProposalSpaceData } from "./utils";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import ProposalSpace from "./ProposalSpace";
import { ProposalProvider } from "@/common/providers/ProposalProvider";

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

  const proposalSpaceData = await loadProposalSpaceData(proposalId, decodedTabNameParam);

  if (!proposalSpaceData) {
    return <SpaceNotFound />;
  }

  return (
    <ProposalProvider
      proposalId={proposalId}
      defaultProposalData={proposalSpaceData.proposalData}
    >
      <ProposalSpace
        spaceData={proposalSpaceData}
        tabName={proposalSpaceData.config.tabNames?.[0] || "Overview"}
      />
    </ProposalProvider>
  );
};

export default ProposalSpacePage;
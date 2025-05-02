export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import { NOUNSBUILD_PROPOSALS_QUERY } from "@/common/lib/utils/queries";
import { ProposalData } from "@/fidgets/community/nouns-dao";
import { ProposalProvider } from "@/common/providers/ProposalProvider";
import ProposalPrimarySpaceContent from "../ProposalPrimarySpaceContent";
import { TokenProvider } from "@/common/providers/TokenProvider";

async function loadProposalData(proposalId: Address): Promise<ProposalData> {
  const response = await fetch("https://www.nouns.camp/subgraphs/nouns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: NOUNSBUILD_PROPOSALS_QUERY,
      variables: {
        where: { proposalId },
      },
    }),
  });

  const data = await response.json();

  return {
    ...data.data,
  };
}

export default async function WrapperProposalPrimarySpace({ params }) {
  const proposalId = params?.proposalId as string;
  const proposalData = await loadProposalData(params || {});

  const props = {
    ...proposalData,
    proposalId,
  };

  return (
    <TokenProvider
      contractAddress={proposalId as Address}
      defaultTokenData={undefined}
      network="base"
    >
      <ProposalProvider
        proposalId={proposalId as Address}
        defaultProposalData={proposalData}
      >
        <ProposalPrimarySpaceContent {...props} />
      </ProposalProvider>
    </TokenProvider>
  );
}

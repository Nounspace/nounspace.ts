export const dynamic = "force-static";
export const revalidate = 60;

import React from "react";
import { Address } from "viem";
import { ProposalProvider } from "@/common/providers/ProposalProvider";
import ProposalDefinedSpace from "../ProposalDefinedSpace";

export interface ProposalData {
  id: string;
  title: string;
  proposer: {
    id: Address;
  };
}

async function loadProposalData(proposalId: string): Promise<ProposalData> {
  try {
    const response = await fetch("https://www.nouns.camp/subgraphs/nouns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query Proposal($proposalId: ID!) {
            proposal(id: $proposalId) {
              id
              title
              proposer {
                id
              }
              signers {
                id
              }
            }
          }`,
        variables: {
          proposalId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch proposal data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      ...data.data,
    };
  } catch (error) {
    console.error("Error loading proposal data:", error);
    // Return a minimal valid object to prevent rendering errors
    return {
      id: proposalId,
      title: "Error loading proposal",
      proposer: {
        id: "0x0",
      },
    };
  }
}

export default async function WrapperProposalPrimarySpace({ params }) {
  const proposalId = params?.proposalId as string;
  const proposalData = await loadProposalData(proposalId || "0");

  console.log("DEBUG proposalData", proposalData);

  const props = {
    ...proposalData,
    proposalId,
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

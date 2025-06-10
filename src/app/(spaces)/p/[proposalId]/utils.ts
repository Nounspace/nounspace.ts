import { Address } from "viem";

export interface ProposalData {
  id: string;
  title: string;
  proposer: {
    id: Address;
  };
  signers?: {
    id: Address;
  }[];
  createdTimestamp?: string;
  forVotes?: string;
  againstVotes?: string;
  abstainVotes?: string;
  quorumVotes?: string;
}

export async function loadProposalData(proposalId: string): Promise<ProposalData> {
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
              createdTimestamp
              proposer {
                id
              }
              signers {
                id
              }
              forVotes
              againstVotes
              abstainVotes
              quorumVotes
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
      ...data.data.proposal,
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
      signers: [],
      createdTimestamp: "",
      forVotes: "0",
      againstVotes: "0",
      abstainVotes: "0",
      quorumVotes: "0",
    };
  }
}

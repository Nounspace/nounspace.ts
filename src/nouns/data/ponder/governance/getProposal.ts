"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import {
  mapProposalOverviewFragmentToProposalOverview,
  ProposalOverview,
} from "./common";
import { getBlockNumber } from "viem/actions";
import { ProposalQuery } from "@nouns/data/generated/ponder";
import { Address, getAddress, Hex } from "viem";

export interface ProposalTransaction {
  to: Address;
  signature: string;
  value: bigint;
  calldata: Hex;
}

export type ProposalVote = NonNullable<
  NonNullable<ProposalQuery["proposal"]>["votes"]
>["items"][0];

export interface Proposal extends ProposalOverview {
  description: string;
  transactions: ProposalTransaction[];
  votes: ProposalVote[];
}

const query = graphql(/* GraphQL */ `
  query Proposal($id: Int!) {
    proposal(id: $id) {
      ...ProposalOverviewFragment
      description

      targets
      signatures
      values
      calldatas

      votes(limit: 1000, orderBy: "timestamp", orderDirection: "desc") {
        items {
          ...proposalVoteFragment
        }
      }
    }
  }
`);

export async function getProposal(id: number): Promise<Proposal | null> {
  const data = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    { id },
    {
      cache: "no-cache",
    },
  );

  const blockNumber = Number(await getBlockNumber(CHAIN_CONFIG.publicClient));
  const timestamp = Math.floor(Date.now() / 1000);

  const proposal = (data as any)?.proposal;

  if (proposal) {
    const overview = mapProposalOverviewFragmentToProposalOverview(
      proposal,
      blockNumber,
      timestamp,
    );
    const transactions: ProposalTransaction[] = proposal.targets.map(
      (target, i) => {
        return {
          to: getAddress(target),
          signature: proposal.signatures[i],
          value: BigInt(proposal.values[i]),
          calldata: proposal.calldatas[i] as Hex,
        };
      },
    );

    return {
      ...overview,
      id: Number(overview.id),
      forVotes: Number(overview.forVotes),
      againstVotes: Number(overview.againstVotes),
      abstainVotes: Number(overview.abstainVotes),
      quorumVotes: Number(overview.quorumVotes),
      executionETA: overview.executionETA ? Number(overview.executionETA) : null,
      description: proposal.description,
      transactions,
      votes: proposal.votes?.items ?? [],
    };
  } else {
    return null;
  }
}

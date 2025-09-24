import { graphql } from "@nouns/data/generated/ponder";
import { ProposalOverviewFragmentFragment } from "@nouns/data/generated/ponder";
import { LastKnownProposalState } from "@nouns/data/generated/ponder";
import { Address, getAddress } from "viem";

const ETHEREUM_BLOCK_TIME_S = 12;

export type ProposalState =
  | "updateable"
  | "pending"
  | "active"
  | "successful"
  | "failed"
  | "queued"
  | "executed"
  | "cancelled"
  | "expired"
  | "vetoed";

export interface ProposalOverview {
  id: number;
  title: string;
  proposerAddress: Address;
  sponsorAddresses: Address[];

  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorumVotes: number;

  state: ProposalState;

  creationBlock: number;
  votingStartBlock: number;
  votingStartTimestamp: number;
  votingEndBlock: number;
  votingEndTimestamp: number;
  executionEtaTimestamp?: number;
}

export const proposalOverviewFragment = graphql(/* GraphQL */ `
  fragment ProposalOverviewFragment on proposal {
    id
    title
    proposerAddress
    sponsorAddresses
    clientId

    quorumVotes
    forVotes
    againstVotes
    abstainVotes

    lastKnownState
    creationBlock
    updatePeriodEndBlock
    votingStartBlock
    votingEndBlock
    executionEtaTimestamp
    expiryTimestamp
  }
`);

export const proposalVoteFragment = graphql(/* GraphQL */ `
  fragment proposalVoteFragment on vote {
    id
    voter
    value
    weight
    reason
    transactionHash
    timestamp

    voteRevotes {
      items {
        revote {
          voter
          value
          reason
        }
      }
    }
    voteReplies {
      items {
        replyVote {
          voter
          value
          reason
        }
        reply
      }
    }
  }
`);

export function mapProposalOverviewFragmentToProposalOverview(
  item: ProposalOverviewFragmentFragment,
  currentBlockNumber: number,
  currentTimestamp: number,
) {
  let state: ProposalState;
  switch (item.lastKnownState) {
    case LastKnownProposalState.Cancelled:
      state = "cancelled";
      break;
    case LastKnownProposalState.Executed:
      state = "executed";
      break;
    case LastKnownProposalState.Vetoed:
      state = "vetoed";
      break;
    case LastKnownProposalState.Updatable:
      if (currentBlockNumber < Number(item.updatePeriodEndBlock)) {
        state = "updateable";
      } else if (currentBlockNumber < Number(item.votingStartBlock)) {
        state = "pending";
      } else if (currentBlockNumber < Number(item.votingEndBlock)) {
        state = "active";
      } else if (
        Number(item.forVotes) <= Number(item.againstVotes) ||
        Number(item.forVotes) < Number(item.quorumVotes)
      ) {
        state = "failed";
      } else {
        state = "successful";
      }
      break;
    case LastKnownProposalState.Queued:
      if (
        item.expiryTimestamp &&
        currentTimestamp > Number(item.expiryTimestamp)
      ) {
        state = "expired";
      } else {
        state = "queued";
      }
      break;
    default:
      state = "pending";
      break;
  }
  // Count be negative
  const blocksToVotingStart = Number(item.votingStartBlock) - currentBlockNumber;
  const blocksToVotingEnd = Number(item.votingEndBlock) - currentBlockNumber;

  return {
    id: item.id,
    title: item.title,
    proposerAddress: getAddress(item.proposerAddress),
    sponsorAddresses: item.sponsorAddresses?.map(getAddress) ?? [],

    forVotes: item.forVotes,
    againstVotes: item.againstVotes,
    abstainVotes: item.abstainVotes,
    quorumVotes: item.quorumVotes,

    state,

    creationBlock: item.creationBlock,
    votingStartBlock: item.votingStartBlock,
    votingStartTimestamp:
      currentTimestamp + blocksToVotingStart * ETHEREUM_BLOCK_TIME_S,
    votingEndBlock: item.votingEndBlock,
    votingEndTimestamp:
      currentTimestamp + blocksToVotingEnd * ETHEREUM_BLOCK_TIME_S,
    executionEtaTimestamp: item.executionEtaTimestamp
      ? Number(item.executionEtaTimestamp)
      : undefined,
  };
}

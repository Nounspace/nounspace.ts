export const NOUNS_PROPOSALS_QUERY = `  query ProposalsQuery {    _meta {      block {        number        timestamp      }    }    proposals(orderBy: startBlock, orderDirection: desc) {      id      title      status      startBlock      endBlock
    }
  }
`;

export const NOUNSBUILD_PROPOSALS_QUERY = `
query proposals(
  $where: Proposal_filter,
  $first: Int! = 100,
  $skip: Int = 0
) {
  proposals(
    where: $where
    first: $first
    skip: $skip
    orderBy: timeCreated
    orderDirection: desc
  ) {
    ...Proposal
    votes {
      ...ProposalVote
    }
  }
}

fragment Proposal on Proposal {
  abstainVotes
  againstVotes
  calldatas
  description
  descriptionHash
  executableFrom
  expiresAt
  forVotes
  proposalId
  proposalNumber
  proposalThreshold
  proposer
  quorumVotes
  targets
  timeCreated
  title
  values
  voteEnd
  voteStart
  snapshotBlockNumber
  transactionHash
  dao {
    governorAddress
    tokenAddress
  }
}

fragment ProposalVote on ProposalVote {
  voter
  support
  weight
  reason
}
`;

export const NOUNS_PROPOSAL_DETAIL_QUERY = `
  query ProposalDetailQuery($id: ID = "") {
    _meta {
      block {
        number
        timestamp
      }
    }
    proposal(id: $id) {
      id
      title
      status
      startBlock
      endBlock
      forVotes
      againstVotes
      abstainVotes
      quorumVotes
      createdTimestamp
      voteSnapshotBlock
      proposer {
        id
        nounsRepresented {
          id
        }
      }
      signers {
        id
        nounsRepresented {
          id
        }
      }
    }
    proposalVersions(
      where: {proposal_: {id: $id}}
      orderBy: createdAt
      orderDirection: desc
    ) {
      createdAt
    }
  }
`;

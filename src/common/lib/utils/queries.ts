export const NOUNS_PROPOSALS_QUERY = `
  query ProposalsQuery {
    proposals(first: 1000, orderBy: createdBlock, orderDirection: desc) {
      id
      title
      status
      forVotes
      againstVotes
      abstainVotes
      quorumVotes
      executionETA
      startBlock
      endBlock
      updatePeriodEndBlock
      objectionPeriodEndBlock
      onTimelockV1
      signers {
        id
        __typename
      }
      __typename
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
    description
    status
    proposalThreshold
    quorumVotes
    forVotes
    againstVotes
    abstainVotes
    createdTransactionHash
    createdBlock
    createdTimestamp
    startBlock
    endBlock
    updatePeriodEndBlock
    objectionPeriodEndBlock
    executionETA
    targets
    values
    signatures
    calldatas
    onTimelockV1
    voteSnapshotBlock
    proposer {
      id
      __typename
    }
    signers {
      id
      __typename
    }
    __typename
  }
}
`;

export const NOUNS_PROPOSALS_QUERY = `
  fragment CandidateContentSignatureFields on ProposalCandidateSignature {
    reason
    canceled
    createdBlock
    createdTimestamp
    createdTransactionHash
    expirationTimestamp
    sig
    signer {
      id
      nounsRepresented { id }
    }
    content { id }
  }
  fragment FullProposalCandidateFields on ProposalCandidate {
    id
    slug
    number
    proposer
    canceledTimestamp
    createdTimestamp
    lastUpdatedTimestamp
    createdBlock
    canceledBlock
    lastUpdatedBlock
    createdTransactionHash
    canceledTransactionHash
    latestVersion {
      id
      content {
        title
        description
        targets
        values
        signatures
        calldatas
        matchingProposalIds
        proposalIdToUpdate
        contentSignatures {
          ...CandidateContentSignatureFields
        }
      }
    }
  }
  query {
    proposals(
      orderBy: createdBlock,
      orderDirection: desc,
      skip: 0,
      first: 40
    ) {
      id
      title
      description
      status
      createdBlock
      createdTimestamp
      createdTransactionHash
      lastUpdatedBlock
      lastUpdatedTimestamp
      startBlock
      endBlock
      updatePeriodEndBlock
      objectionPeriodEndBlock
      canceledBlock
      canceledTimestamp
      canceledTransactionHash
      queuedBlock
      queuedTimestamp
      queuedTransactionHash
      executedBlock
      executedTimestamp
      executedTransactionHash
      forVotes
      againstVotes
      abstainVotes
      quorumVotes
      executionETA
      proposer { id }
      signers { id }
      targets
      values
      signatures
      calldatas
    }
    proposalCandidates(
      orderBy: createdBlock,
      orderDirection: desc,
      skip: 0,
      first: 40
    ) {
      ...FullProposalCandidateFields
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
  fragment VoteFields on Vote {
    id
    blockNumber
    blockTimestamp
    transactionHash
    reason
    supportDetailed
    votes
    voter {
      id
    }
    proposal {
      id
    }
  }

  fragment ProposalFeedbackFields on ProposalFeedback {
    id
    reason
    supportDetailed
    createdBlock
    createdTimestamp
    votes
    voter {
      id
      nounsRepresented {
        id
      }
    }
    proposal {
      id
    }
  }

  fragment FullProposalFields on Proposal {
    id
    status
    title
    description
    createdBlock
    createdTimestamp
    createdTransactionHash
    lastUpdatedBlock
    lastUpdatedTimestamp
    startBlock
    endBlock
    updatePeriodEndBlock
    objectionPeriodEndBlock
    canceledBlock
    canceledTimestamp
    canceledTransactionHash
    queuedBlock
    queuedTimestamp
    queuedTransactionHash
    executedBlock
    executedTimestamp
    executedTransactionHash
    targets
    signatures
    calldatas
    values
    forVotes
    againstVotes
    abstainVotes
    executionETA
    quorumVotes
    adjustedTotalSupply
    proposer {
      id
    }
    signers {
      id
    }
    votes {
      ...VoteFields
    }
    feedbackPosts {
      ...ProposalFeedbackFields
    }
  }

  query ProposalDetailQuery($id: ID = "") {
    _meta {
      block {
        number
        timestamp
      }
    }
    proposal(id: $id) {
      ...FullProposalFields
    }
    proposalVersions(where: { proposal: $id }) {
      createdAt
      createdBlock
      createdTransactionHash
      updateMessage
      proposal {
        id
      }
    }
    proposalCandidateVersions(
      where: { content_: { matchingProposalIds_contains: [$id] } }
    ) {
      id
      createdBlock
      createdTimestamp
      updateMessage
      proposal {
        id
      }
      content {
        matchingProposalIds
        proposalIdToUpdate
      }
    }
  }
`;

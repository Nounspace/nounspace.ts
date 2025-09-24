// Generated GraphQL utilities
export const graphql = (query: string) => query

// Common GraphQL fragments and queries
export const PROPOSAL_OVERVIEW_FRAGMENT = `
  fragment ProposalOverview on Proposal {
    id
    title
    proposer
    status
    forVotes
    againstVotes
    abstainVotes
    startBlock
    endBlock
    executionETA
    targets
    values
    signatures
    calldatas
    description
  }
`

export const GET_PROPOSALS_QUERY = `
  query GetProposals($first: Int!, $skip: Int!) {
    proposals(first: $first, skip: $skip, orderBy: startBlock, orderDirection: desc) {
      ...ProposalOverview
    }
  }
  ${PROPOSAL_OVERVIEW_FRAGMENT}
`

export const GET_PROPOSAL_BY_ID_QUERY = `
  query GetProposalById($id: ID!) {
    proposal(id: $id) {
      ...ProposalOverview
    }
  }
  ${PROPOSAL_OVERVIEW_FRAGMENT}
`

// GraphQL types
export interface AllNounsQuery {
  nouns: Array<{
    id: string
    tokenId: string
    owner: {
      id: string
    }
    seed: {
      background: number
      body: number
      accessory: number
      head: number
      glasses: number
    }
    // Add other fields as needed
  }>
}

// TypedDocumentString type for GraphQL queries
export type TypedDocumentString<Result, Variables> = string

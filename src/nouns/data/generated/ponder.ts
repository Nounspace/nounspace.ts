// Generated ponder types and utilities
export const graphql = (query: string) => query

// GraphQL types
export type VoteValue = 'FOR' | 'AGAINST' | 'ABSTAIN'

// VoteValue enum for runtime usage
export const VoteValue = {
  For: 'FOR' as const,
  Against: 'AGAINST' as const,
  Abstain: 'ABSTAIN' as const,
} as const

export interface ProposalOverviewFragmentFragment {
  id: string
  title: string
  proposer: string
  status: string
  forVotes: string
  againstVotes: string
  abstainVotes: string
  startBlock: string
  endBlock: string
  executionETA: string | null
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
  description: string
  lastKnownState: LastKnownProposalState
  updatePeriodEndBlock: string
  votingStartBlock: string
  votingEndBlock: string
  quorumVotes: string
  expiryTimestamp: string | null
  proposerAddress: string
  sponsorAddresses: string[]
  creationBlock: string
  executionEtaTimestamp: string | null
}

export type LastKnownProposalState = 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'DEFEATED' | 'SUCCEEDED' | 'QUEUED' | 'EXPIRED' | 'EXECUTED' | 'VETOED' | 'UPDATABLE'

// LastKnownProposalState enum for runtime usage
export const LastKnownProposalState = {
  Pending: 'PENDING' as const,
  Active: 'ACTIVE' as const,
  Cancelled: 'CANCELLED' as const,
  Defeated: 'DEFEATED' as const,
  Succeeded: 'SUCCEEDED' as const,
  Queued: 'QUEUED' as const,
  Expired: 'EXPIRED' as const,
  Executed: 'EXECUTED' as const,
  Vetoed: 'VETOED' as const,
  Updatable: 'UPDATABLE' as const,
} as const

export interface ProposalQuery {
  proposal: {
    id: string
    title: string
    proposer: string
    status: string
    forVotes: string
    againstVotes: string
    abstainVotes: string
    startBlock: string
    endBlock: string
    executionETA: string | null
    targets: string[]
    values: string[]
    signatures: string[]
    calldatas: string[]
    description: string
    votes: {
      items: Array<{
        id: string
        voter: string
        support: string
        votes: string
        reason: string | null
        blockNumber: string
        blockTimestamp: string
        transactionHash: string
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
    }
  }
}

export interface DailyFinancialSnapshotsQuery {
  dailyFinancialSnapshots: {
    items: Array<{
      id: string
      timestamp: number
      treasuryBalanceInEth: string
      treasuryBalanceInUsd: string
      auctionRevenueInUsd: string
      auctionRevenueInEth: string
      propSpendInUsd: string
      propSpendInEth: string
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface DepositsQuery {
  deposits: Array<{
    id: string
    timestamp: number
    amount: string
    from: string
  }>
  nounsErc20Deposits: {
    items: Array<{
      depositorAccountAddress: string
      nounsNftId: string
      transaction: {
        hash: string
        timestamp: string
      }
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface RedeemsQuery {
  redeems: Array<{
    id: string
    timestamp: number
    amount: string
    to: string
  }>
  nounsErc20Redeems: {
    items: Array<{
      redeemerAccountAddress: string
      nounsNftId: string
      transaction: {
        hash: string
        timestamp: string
      }
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface SwapsQuery {
  swaps: Array<{
    id: string
    timestamp: number
    amountIn: string
    amountOut: string
    from: string
    to: string
  }>
  nounsErc20Swaps: {
    items: Array<{
      swapperAccountAddress: string
      fromNounsNftId: string
      toNounsNftId: string
      transaction: {
        hash: string
        timestamp: string
      }
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface AccountLeaderboardQuery {
  accountLeaderboard: Array<{
    id: string
    address: string
    totalVotes: string
    totalProposals: string
  }>
}

export interface ClientsQuery {
  clients: {
    items: Array<{
      id: string
      name: string
      url: string
      icon: string
      approved: boolean
      rewardAmount: string
      auctionsWon: number
      votesCast: number
      proposalsCreated: number
    }>
  }
}

// Types are already exported as interfaces above

// TypedDocumentString type for GraphQL queries
export type TypedDocumentString<Result, Variables> = string
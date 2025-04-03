export type BaseProposalData = {
  id: string;
  title: string;
  status?: string;
  startBlock: string;
  endBlock: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorumVotes: string;
  createdBlock: string;
  createdTimestamp: string;
  createdTransactionHash: string;
  lastUpdatedBlock?: string;
  lastUpdatedTimestamp?: string;
  canceledBlock?: string;
  canceledTimestamp?: string;
  canceledTransactionHash?: string;
  queuedBlock?: string;
  queuedTimestamp?: string;
  queuedTransactionHash?: string;
  executedBlock?: string;
  executedTimestamp?: string;
  executedTransactionHash?: string;
};

export type DelegateData = {
  id: string;
  nounsRepresented?: {
    id: string;
  }[];
  __typename?: string;
};

export type NounsProposalData = BaseProposalData & {
  description: string;
  proposalThreshold?: string;
  updatePeriodEndBlock?: string;
  objectionPeriodEndBlock?: string;
  executionETA?: string | null;
  targets?: string[];
  values?: string[];
  signatures?: string[];
  calldatas?: string[];
  onTimelockV1?: boolean | null;
  voteSnapshotBlock?: string;
  proposer: DelegateData;
  signers: DelegateData[];
  __typename?: string;
};

export type BuilderProposalData = BaseProposalData & {
  proposalId: string;
  proposalNumber: string;
  proposalThreshold: string;
  proposer: string;
  calldatas: string[];
  description: string;
  descriptionHash: string;
  executableFrom: string;
  expiresAt: string;
  targets: string[];
  timeCreated: string;
  values: string[];
  voteEnd: string;
  voteStart: string;
  snapshotBlockNumber: string;
  transactionHash: string;
  dao: {
    governorAddress: string;
    tokenAddress: string;
  };
  votes: {
    voter: string;
    support: number;
    weight: string;
    reason?: string;
  }[];
};

export type ProposalData = NounsProposalData | BuilderProposalData;

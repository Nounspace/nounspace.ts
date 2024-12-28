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
};

export type NounsProposalData = BaseProposalData & {
  createdTimestamp: string;
  voteSnapshotBlock: string;
  proposer: {
    id: string;
    nounsRepresented: {
      id: string;
    }[];
  };
  signers: {
    id: string;
    nounsRepresented: {
      id: string;
    }[];
  }[];
  description: string;
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

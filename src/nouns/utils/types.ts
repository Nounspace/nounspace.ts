import { Noun } from "@nouns/data/noun/types";

export type BigIntString = string;

// Need our own to add success and failed, extends ProposalStatus (autogen)
export enum ProposalState {
  Active = "ACTIVE",
  Cancelled = "CANCELED",
  Executed = "EXECUTED",
  Pending = "PENDING",
  Queued = "QUEUED",
  Vetoed = "VETOED",
  Succeeded = "SUCCEEDED",
  Defeated = "DEFEATED",
  Candidate = "CANDIDATE",
}

export interface SwapNounProposal {
  id: number | string;
  fromNoun: Noun;
  toNoun: Noun;
  state: ProposalState;
}

export type Unit = "%" | "$";

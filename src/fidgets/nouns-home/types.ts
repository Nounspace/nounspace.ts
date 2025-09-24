import type { Address } from "viem";

export type Auction = {
  nounId: bigint;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  bidder: Address;
  settled: boolean;
};

export type Settlement = {
  blockTimestamp: number;
  amount: bigint;
  winner: Address;
  nounId: bigint;
  clientId: number;
};

export type AuctionStatus = "pending" | "active" | "ended";

export type BigNumberishString = `${number}` | string;

export interface AuctionBid {
  amount: BigNumberishString;
  bidder?: {
    id: string;
  } | null;
  blockTimestamp: string;
  txHash: string;
}

export interface AuctionData {
  id: string;
  noun: {
    id: string;
  };
  amount: BigNumberishString;
  startTime: string;
  endTime: string;
  bidder?: {
    id: string;
  } | null;
  settled: boolean;
  bids: AuctionBid[];
}

export interface AuctionSettings {
  reservePrice: bigint;
  minBidIncrementPercentage: bigint;
}

export interface AuctionWithState extends AuctionData {
  state: "live" | "ended-unsettled" | "ended-settled";
  highestBid: bigint;
  nextMinBid: bigint;
}

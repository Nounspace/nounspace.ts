import { BigIntString } from "@nouns/utils/types";
import { Address, Hex } from "viem";

export interface Bid {
  transactionHash: Hex;
  bidderAddress: Address;
  amount: BigIntString;
  timestamp: BigIntString;
  clientId?: number;
}

export interface Auction {
  nounId: BigIntString;

  startTime: BigIntString;
  endTime: BigIntString;

  nextMinBid: BigIntString; // Only relevant for live auctions

  state: "live" | "ended-unsettled" | "ended-settled";

  bids: Bid[]; // Ordered most recent to oldest, highest bid is bids[0] (could be empty)

  nounderAuction: boolean;
}

"use server";
import { graphql } from "../generated/gql";
import { graphQLFetchWithFallback } from "../utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { BigIntString } from "@nouns/utils/types";
import { Auction, Bid } from "./types";
import { Hex, getAddress } from "viem";
import { getProtocolParams } from "../protocol/getProtocolParams";
import { bigIntMax } from "@nouns/utils/bigint";
import { revalidateTag, unstable_cache } from "next/cache";

const NOUNDER_AUCTION_CUTOFF = BigInt(1820);

const query = graphql(/* GraphQL */ `
  query Auction($id: ID!) {
    auction(id: $id) {
      id
      noun {
        id
      }
      amount
      startTime
      endTime
      bidder {
        id
      }
      clientId
      settled
      bids {
        txHash
        bidder {
          id
        }
        amount
        blockTimestamp
        clientId
      }
    }
  }
`);

async function getAuctionByIdUncached(
  id: BigIntString,
): Promise<Auction | undefined> {
  if (
    BigInt(id) <= NOUNDER_AUCTION_CUTOFF &&
    BigInt(id) % BigInt(10) == BigInt(0)
  ) {
    const nextNoun = await getAuctionByIdUncached(
      (BigInt(id) + BigInt(1)).toString(),
    );
    return {
      nounId: id,

      startTime: nextNoun?.startTime ?? "0",
      endTime: nextNoun?.startTime ?? "0",

      nextMinBid: "0",

      state: "ended-settled",

      bids: [],

      nounderAuction: true,
    };
  }

  const [result, params] = await Promise.all([
    graphQLFetchWithFallback(
      CHAIN_CONFIG.subgraphUrl,
      query,
      { id },
      { next: { revalidate: 0 } },
    ),
    getProtocolParams(),
  ]);

  const auction = (result as any)?.auction;
  if (!auction) {
    console.error("getAuctionByIdUncached - no auction found", id);
    return undefined;
  }

  const bids: Bid[] = auction.bids.map((bid: any) => ({
    transactionHash: bid.txHash as Hex,
    bidderAddress: getAddress(bid.bidder.id),
    amount: bid.amount,
    timestamp: bid.blockTimestamp,
    clientId: bid.clientId ?? undefined,
  }));

  // Sort descending by amount
  bids.sort((a, b) => (BigInt(b.amount) > BigInt(a.amount) ? 1 : -1));

  const highestBidAmount =
    auction.bids.length > 0 ? BigInt(bids[0].amount) : BigInt(0);
  const nextMinBid = bigIntMax(
    BigInt(params.reservePrice),
    highestBidAmount +
      (highestBidAmount * BigInt(params.minBidIncrementPercentage)) /
        BigInt(100),
  );

  const nowS = Date.now() / 1000;
  const ended = nowS > Number(auction.endTime);

  return {
    nounId: auction.noun.id,

    startTime: auction.startTime,
    endTime: auction.endTime,

    nextMinBid: nextMinBid.toString(),

    state: ended
      ? auction.settled
        ? "ended-settled"
        : "ended-unsettled"
      : "live",

    bids,

    nounderAuction: false,
  } as Auction;
}

const getAuctionByIdCached = unstable_cache(
  getAuctionByIdUncached,
  ["get-auction-by-id"],
  {
    tags: ["get-auction-by-id"],
  },
);

export async function getAuctionById(id: BigIntString) {
  const cachedAuction = await getAuctionByIdCached(id);

  if (cachedAuction?.state != "ended-settled") {
    revalidateTag("get-auction-by-id");
    return await getAuctionByIdCached(id);
  }

  return cachedAuction;
}

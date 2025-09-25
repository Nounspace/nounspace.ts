import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { AuctionData, AuctionSettings } from "./types";
import nounsAuctionHouseAbi from "./nounsAuctionHouseAbi";

const DEFAULT_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_NOUNS_SUBGRAPH_URL ??
  "https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph";

const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  : process.env.NEXT_PUBLIC_NOUNS_MAINNET_RPC ?? "https://ethereum.publicnode.com";

export const nounsPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(MAINNET_RPC_URL),
});

async function graphFetch<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(DEFAULT_SUBGRAPH_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 10 },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((err) => err.message).join("\n"));
  }

  return json.data as T;
}

export async function fetchCurrentAuctionId(): Promise<string> {
  const data = await graphFetch<{ auctions: { id: string }[] }>(`
    query CurrentAuction {
      auctions(first: 1, orderBy: endTime, orderDirection: desc) {
        id
      }
    }
  `);

  return data.auctions?.[0]?.id ?? "1";
}

export async function fetchAuctionById(id: string): Promise<AuctionData | null> {
  if (!id) return null;
  const data = await graphFetch<{ auction?: AuctionData | null }>(`
    query Auction($id: ID!) {
      auction(id: $id) {
        id
        noun { id }
        amount
        startTime
        endTime
        bidder { id }
        settled
        bids(orderBy: amount, orderDirection: desc) {
          amount
          bidder { id }
          blockTimestamp
          txHash
        }
      }
    }
  `, { id });

  return data.auction ?? null;
}

export async function fetchRecentAuctions(limit: number, skip = 0) {
  const data = await graphFetch<{ auctions: AuctionData[] }>(`
    query RecentAuctions($first: Int!, $skip: Int!) {
      auctions(orderBy: endTime, orderDirection: desc, first: $first, skip: $skip) {
        id
        noun { id }
        amount
        startTime
        endTime
        bidder { id }
        settled
        bids(orderBy: amount, orderDirection: desc, first: 1) {
          amount
          bidder { id }
          blockTimestamp
          txHash
        }
      }
    }
  `, { first: limit, skip });

  return data.auctions ?? [];
}

export async function fetchAuctionSettings(): Promise<AuctionSettings> {
  const [reservePrice, minBidIncrementPercentage] = await nounsPublicClient.readContract({
    abi: nounsAuctionHouseAbi,
    address: "0x830BD73E4184ceF73443C15111a1DF14e495C706",
    functionName: "reservePrice",
  }).then(async (reserve) => {
    const minIncrement = await nounsPublicClient.readContract({
      abi: nounsAuctionHouseAbi,
      address: "0x830BD73E4184ceF73443C15111a1DF14e495C706",
      functionName: "minBidIncrementPercentage",
    });
    return [reserve as bigint, minIncrement as bigint];
  });

  return {
    reservePrice,
    minBidIncrementPercentage,
  };
}

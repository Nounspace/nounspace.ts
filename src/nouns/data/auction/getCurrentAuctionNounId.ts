"use server";
import { BigIntString } from "@nouns/utils/types";
import { CHAIN_CONFIG } from "@nouns/config";
import { graphql } from "../generated/gql";
import { graphQLFetchWithFallback } from "../utils/graphQLFetch";

const query = graphql(/* GraphQL */ `
  query CurrentAuctionId {
    auctions(orderBy: endTime, orderDirection: desc, first: 1) {
      id
    }
  }
`);

export async function getCurrentAuctionNounId(): Promise<BigIntString> {
  const result = await graphQLFetchWithFallback(
    CHAIN_CONFIG.subgraphUrl,
    query,
    {},
    { next: { revalidate: 2 } },
  );
  const currentAuction = (result as any)?.auctions?.[0] ?? null;
  return currentAuction?.id ?? "1";
}

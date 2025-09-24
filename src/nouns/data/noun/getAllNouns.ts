"use server";
import { CHAIN_CONFIG } from "@nouns/config";
import { graphql } from "../generated/gql";
import { graphQLFetchWithFallback } from "../utils/graphQLFetch";
import { Noun } from "./types";
import { AllNounsQuery } from "../generated/gql";
import { revalidateTag, unstable_cache } from "next/cache";
import { transformQueryNounToNoun } from "./helpers";
import { getSecondaryNounListings } from "./getSecondaryNounListings";

const BATCH_SIZE = 1000;

const query = graphql(/* GraphQL */ `
  query AllNouns($batchSize: Int!, $skip: Int!) {
    nouns(first: $batchSize, skip: $skip) {
      id
      owner {
        id
      }
      seed {
        background
        body
        accessory
        head
        glasses
      }
    }
  }
`);

async function runPaginatedNounsQueryUncached() {
  let queryNouns: AllNounsQuery["nouns"] = [];
  let skip = 0;

  while (true) {
    const response = await graphQLFetchWithFallback(
      CHAIN_CONFIG.subgraphUrl,
      query,
      { batchSize: BATCH_SIZE, skip },
      { next: { revalidate: 0 } },
    );
    const responseNouns = (response as any)?.nouns;
    if (!responseNouns) {
      break;
    }

    queryNouns = queryNouns.concat(responseNouns);

    if (responseNouns.length == BATCH_SIZE) {
      skip += BATCH_SIZE;
    } else {
      break;
    }
  }

  return queryNouns;
}

const runPaginatedNounsQuery = unstable_cache(
  runPaginatedNounsQueryUncached,
  ["run-paginated-nouns-query", CHAIN_CONFIG.chain.id.toString()],
  {
    revalidate: 5 * 60, // 5min
    tags: [`paginated-nouns-query-${CHAIN_CONFIG.chain.id.toString()}`],
  },
);

export async function getAllNounsUncached(): Promise<Noun[]> {
  const [queryResponse, secondaryNounListings] = await Promise.all([
    runPaginatedNounsQueryUncached(),
    getSecondaryNounListings(),
  ]);
  let nouns = queryResponse.map(transformQueryNounToNoun);

  // Sort by id, descending
  nouns.sort((a, b) => (BigInt(b.id) > BigInt(a.id) ? 1 : -1));

  const fullNouns = nouns.map((noun) => ({
    ...noun,
    secondaryListing: secondaryNounListings.find(
      (listing) => listing.nounId === noun.id,
    ),
  })) as Noun[];

  return fullNouns;
}

export async function getAllNouns(): Promise<Noun[]> {
  const [queryResponse, secondaryNounListings] = await Promise.all([
    runPaginatedNounsQuery(),
    getSecondaryNounListings(),
  ]);
  let nouns = queryResponse.map(transformQueryNounToNoun);

  // Sort by id, descending
  nouns.sort((a, b) => (BigInt(b.id) > BigInt(a.id) ? 1 : -1));

  const fullNouns = nouns.map((noun) => ({
    ...noun,
    secondaryListing: secondaryNounListings.find(
      (listing) => listing.nounId === noun.id,
    ),
  })) as Noun[];

  return fullNouns;
}

export async function forceAllNounRevalidation() {
  revalidateTag(`paginated-nouns-query-${CHAIN_CONFIG.chain.id.toString()}`);
}

export async function checkForAllNounRevalidation(nounId: string) {
  const allNouns = await getAllNouns();
  if (allNouns[0]?.id && BigInt(allNouns[0].id) < BigInt(nounId)) {
    forceAllNounRevalidation();
  }
}

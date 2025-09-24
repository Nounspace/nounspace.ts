"use server";
import { Noun } from "./types";
import { checkForAllNounRevalidation, forceAllNounRevalidation, getAllNouns } from "./getAllNouns";
import { graphql } from "../generated/gql";
import { graphQLFetchWithFallback } from "../utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { transformQueryNounToNoun } from "./helpers";
import { unstable_cache } from "next/cache";
import { SECONDS_PER_HOUR } from "@nouns/utils/constants";
import { getSecondaryListingForNoun } from "./getSecondaryNounListings";

const query = graphql(/* GraphQL */ `
  query NounById($id: ID!) {
    noun(id: $id) {
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

export async function getNounByIdUncached(id: string): Promise<Noun | undefined> {
  const [response, secondaryListing] = await Promise.all([
    graphQLFetchWithFallback(CHAIN_CONFIG.subgraphUrl, query, { id }, { next: { revalidate: 0 } }),
    getSecondaryListingForNoun(id),
  ]);
  const noun = response ? transformQueryNounToNoun((response as any).noun) : undefined;

  if (noun) {
    checkForAllNounRevalidation(id);
    const fullNoun: Noun = { ...noun, secondaryListing };
    return fullNoun;
  } else {
    return undefined;
  }
}

const getNounByIdCached = unstable_cache(getNounByIdUncached, ["get-noun-by-id"], { revalidate: SECONDS_PER_HOUR });

export async function getNounById(id: string): Promise<Noun | undefined> {
  const [noun, secondaryListing] = await Promise.all([getNounByIdCached(id), getSecondaryListingForNoun(id)]);

  // Kickoff a check to revalidate all in grid (when its a new Noun)
  checkForAllNounRevalidation(id);

  return noun;
}

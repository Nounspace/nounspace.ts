"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_HOUR } from "@nouns/utils/constants";

const query = graphql(/* GraphQL */ `
  query ProposalTitle($id: Int!) {
    proposal(id: $id) {
      title
    }
  }
`);

export async function getProposalTitle(id: number): Promise<string | null> {
  const data = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    { id },
    {
      next: {
        revalidate: SECONDS_PER_HOUR,
      },
    },
  );

  return data?.proposal?.title ?? null;
}

"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";

const query = graphql(/* GraphQL */ `
  query ExecutedProposalsCount {
    executedProposals {
      totalCount
    }
  }
`);

export async function getExecutedProposalsCount(): Promise<number> {
  const data = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    {},
    {
      next: {
        revalidate: SECONDS_PER_DAY,
      },
    },
  );

  return (data as any)?.executedProposals.totalCount ?? 0;
}

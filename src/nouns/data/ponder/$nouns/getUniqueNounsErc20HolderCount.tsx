"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";

const query = graphql(/* GraphQL */ `
  query UniqueNounsErc20Holder {
    accounts(
      where: {
        OR: [
          { nounsErc20MainnetBalance_gt: "0" }
          { nounsErc20BaseBalance_gt: "0" }
        ]
      }
      limit: 1000
    ) {
      totalCount
    }
  }
`);

export async function getUniqueNounsErc20HolderCount(): Promise<number> {
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

  return (data as any)?.accounts.totalCount ?? 0;
}

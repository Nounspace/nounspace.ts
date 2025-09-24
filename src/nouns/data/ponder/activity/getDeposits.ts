"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { DepositsQuery } from "@nouns/data/generated/ponder";
import { CHAIN_CONFIG } from "@nouns/config";

const query = graphql(/* GraphQL */ `
  query Deposits($cursor: String) {
    nounsErc20Deposits(limit: 1000, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      items {
        depositorAccountAddress
        nounsNftId
        transaction {
          hash
          timestamp
        }
      }
    }
  }
`);

async function runPaginatedQuery() {
  let cursor: string | undefined | null = undefined;
  let items: DepositsQuery["nounsErc20Deposits"]["items"] = [];
  while (true) {
    const data: DepositsQuery | null = await graphQLFetch(
      CHAIN_CONFIG.ponderIndexerUrl,
      query,
      { cursor },
      {
        next: {
          revalidate: 0,
        },
      },
    );
    if (!data) {
      break;
    }

    items = items.concat(data.nounsErc20Deposits.items);

    if (
      data.nounsErc20Deposits.pageInfo.hasNextPage &&
      data.nounsErc20Deposits.pageInfo.endCursor
    ) {
      cursor = data.nounsErc20Deposits.pageInfo.endCursor;
    } else {
      break;
    }
  }

  return items;
}

export async function getDeposits() {
  const data = await runPaginatedQuery();
  return data;
}

"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { RedeemsQuery, SwapsQuery } from "@nouns/data/generated/ponder/graphql";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { CHAIN_CONFIG } from "@nouns/config";

const query = graphql(/* GraphQL */ `
  query Swaps($cursor: String) {
    nounsErc20Swaps(limit: 1000, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      items {
        swapperAccountAddress
        fromNounsNftId
        toNounsNftId
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
  let items: SwapsQuery["nounsErc20Swaps"]["items"] = [];
  while (true) {
    const data: SwapsQuery | null = await graphQLFetch(
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

    items = items.concat(data.nounsErc20Swaps.items);

    if (
      data.nounsErc20Swaps.pageInfo.hasNextPage &&
      data.nounsErc20Swaps.pageInfo.endCursor
    ) {
      cursor = data.nounsErc20Swaps.pageInfo.endCursor;
    } else {
      break;
    }
  }

  return items;
}

export async function getSwaps() {
  const data = await runPaginatedQuery();
  return data;
}

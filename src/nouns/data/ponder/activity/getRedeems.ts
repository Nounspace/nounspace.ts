"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { RedeemsQuery } from "@nouns/data/generated/ponder";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { CHAIN_CONFIG } from "@nouns/config";

const query = graphql(/* GraphQL */ `
  query Redeems($cursor: String) {
    nounsErc20Redeems(limit: 1000, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      items {
        redeemerAccountAddress
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
  let items: RedeemsQuery["nounsErc20Redeems"]["items"] = [];
  while (true) {
    const data: RedeemsQuery | null = await graphQLFetch(
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

    items = items.concat(data.nounsErc20Redeems.items);

    if (
      data.nounsErc20Redeems.pageInfo.hasNextPage &&
      data.nounsErc20Redeems.pageInfo.endCursor
    ) {
      cursor = data.nounsErc20Redeems.pageInfo.endCursor;
    } else {
      break;
    }
  }

  return items;
}

export async function getRedeems() {
  const data = await runPaginatedQuery();
  return data;
}

"use server";
import { graphql } from "@nouns/data/generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { CHAIN_CONFIG } from "@nouns/config";
import { getBlockNumber } from "viem/actions";
import {
  mapProposalOverviewFragmentToProposalOverview,
  ProposalOverview,
} from "./common";

const query = graphql(/* GraphQL */ `
  query AllProposals {
    proposals(limit: 1000) {
      items {
        ...ProposalOverviewFragment
      }
    }
  }
`);

export async function getProposalOverviews(): Promise<ProposalOverview[]> {
  const data = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    {},
    {
      cache: "no-cache",
    },
  );

  if (!data) {
    return [];
  }

  const blockNumber = Number(await getBlockNumber(CHAIN_CONFIG.publicClient));
  const timestamp = Math.floor(Date.now() / 1000);
  const overviews: ProposalOverview[] = data.proposals.items.map((item) =>
    mapProposalOverviewFragmentToProposalOverview(item, blockNumber, timestamp),
  );

  return overviews;
}

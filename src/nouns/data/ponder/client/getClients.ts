"use server";
import { graphql } from "../../generated/ponder";
import { graphQLFetch } from "@nouns/data/utils/graphQLFetch";
import { ClientsQuery } from "../../generated/ponder";
import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import { formatEther } from "viem";

const CLIENT_INFO: Record<number, { url: string; icon: string } | undefined> = {
  1: {
    url: "https://studio.noundry.wtf",
    icon: "https://studio.noundry.wtf/favicon.ico",
  },
  2: { url: "https://houseofnouns.wtf", icon: "/client/unknown.svg" },
  3: { url: "https://www.nouns.camp", icon: "/client/camp.png" },
  4: { url: "https://nouns.biz", icon: "/client/unknown.svg" },
  5: { url: "/", icon: "/app-icon.jpeg" },
  6: { url: "https://www.nouns.game", icon: "/client/game.png" },
  7: { url: "https://nouns.sh", icon: "/client/sh.png" },
  8: { url: "https://nouns.gg", icon: "https://nouns.gg/logo/logo.svg" },
  9: { url: "https://www.probe.wtf", icon: "/client/probe.svg" },
  10: {
    url: "https://nounsagora.com",
    icon: "https://nounsagora.com/favicon.ico",
  },
  11: { url: "https://nouns.farm", icon: "/client/unknown.svg" },
  12: { url: "https://proplaunchpad.com", icon: "/client/unknown.svg" },
  13: { url: "https://www.etherscan.io", icon: "/client/etherscan.png" },
  14: { url: "https://pronouns.gg", icon: "https://pronouns.gg/favicon.ico" },
  15: {
    url: "https://nouns.auction",
    icon: "https://nouns.auction/favicon.ico",
  },
  16: {
    url: "https://lighthouse.cx",
    icon: "https://lighthouse.cx/favicon.ico",
  },
  17: { url: "https://protocol.nouns.camp", icon: "/client/camp.png" },
  18: { url: "https://anouns.eth.limo/", icon: "/client/unknown.svg" },
  19: { url: "https://www.etherscan.io", icon: "/client/etherscan.png" },
};

export interface Client {
  id: number;
  name: string;
  approved: boolean;

  rewardAmountEth: number;

  auctionsWon: number;
  votesCast: number;
  proposalsCreated: number;

  url?: string;
  icon?: string;
}

const query = graphql(/* GraphQL */ `
  query Clients {
    clients(orderBy: "id", orderDirection: "asc", limit: 1000) {
      items {
        id
        name
        approved

        rewardAmount

        auctionsWon
        votesCast
        proposalsCreated
      }
    }
  }
`);

export async function getClients(): Promise<Client[]> {
  const data: ClientsQuery | null = await graphQLFetch(
    CHAIN_CONFIG.ponderIndexerUrl,
    query,
    undefined,
    {
      next: {
        revalidate: SECONDS_PER_DAY / 2,
      },
    },
  );

  if (!data) {
    return [];
  }

  const clients: Client[] = data.clients.items.map((c) => {
    const clientInfo = CLIENT_INFO[c.id];

    return {
      id: c.id,
      name: c.name,
      approved: c.approved,

      rewardAmountEth: Number(formatEther(BigInt(c.rewardAmount))),

      auctionsWon: c.auctionsWon,
      votesCast: c.votesCast,
      proposalsCreated: c.proposalsCreated,

      url: clientInfo?.url,
      icon: clientInfo?.icon,
    };
  });

  return clients;
}

export async function getClientForId(id: number): Promise<Client | undefined> {
  const clients = await getClients();
  return clients.find((client) => client.id == id);
}

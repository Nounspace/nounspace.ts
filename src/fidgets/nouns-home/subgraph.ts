export type NounsStats = {
  executedProposals?: number;
  currentTokenHolders?: number;
};

const ENDPOINT =
  process.env.NOUNS_SUBGRAPH_URL ||
  'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Subgraph error ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Subgraph: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

export async function fetchExecutedProposalsCount(): Promise<number> {
  const page = 1000;
  let skip = 0;
  let total = 0;
  // paginate to be safe, though currently < 1000
  for (let i = 0; i < 10; i++) {
    const data = await gql<{ proposals: { id: string }[] }>(
      `query Executed($first:Int!,$skip:Int!){
        proposals(first:$first, skip:$skip, where:{status:EXECUTED}){ id }
      }`,
      { first: page, skip },
    );
    const count = data.proposals?.length ?? 0;
    total += count;
    if (count < page) break;
    skip += page;
  }
  return total;
}

export async function fetchCurrentTokenHolders(): Promise<number | undefined> {
  const data = await gql<{ governances: { currentTokenHolders: string }[] }>(
    `query Gov{ governances(first:1){ currentTokenHolders } }`,
  );
  const v = data.governances?.[0]?.currentTokenHolders;
  return v ? Number(v) : undefined;
}

export type SubgraphAuction = {
  id: string; // nounId
  amount: string;
  startTime: string;
  endTime: string;
  settled: boolean;
  bidder?: { id: string } | null;
};

export async function fetchLatestAuction(): Promise<SubgraphAuction | null> {
  const data = await gql<{ auctions: SubgraphAuction[] }>(
    `query LatestAuction { auctions(first: 1, orderBy: startTime, orderDirection: desc) { id amount startTime endTime settled bidder { id } } }`,
  );
  return data.auctions?.[0] ?? null;
}

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

export async function fetchAuctionById(nounId: bigint | number | string): Promise<SubgraphAuction | null> {
  const id = typeof nounId === 'string' ? nounId : String(nounId);
  const data = await gql<{ auctions: SubgraphAuction[] }>(
    `query AuctionById($id: ID!) { auctions(where: { id: $id }) { id amount startTime endTime settled bidder { id } } }`,
    { id },
  );
  return data.auctions?.[0] ?? null;
}

export async function fetchNounSeedBackground(nounId: bigint | number | string): Promise<number | undefined> {
  const id = typeof nounId === 'string' ? nounId : String(nounId);
  const data = await gql<{ nouns: { seed?: { background: string } | null }[] }>(
    `query NounSeed($id: ID!) { nouns(where: { id: $id }) { seed { background } } }`,
    { id },
  );
  const bg = data.nouns?.[0]?.seed?.background;
  return bg ? Number(bg) : undefined;
}

// Minimal background palette from nouns.com image data (cool, warm)
export const NOUNS_BG_HEX = ["#d5d7e1", "#e1d7d5"] as const;

// Optional: fetch holder count from nouns.com's Ponder indexer (same source they use)
// Requires env var NOUNS_PONDER_URL or NEXT_PUBLIC_NOUNS_PONDER_URL
export async function fetchAccountLeaderboardCount(): Promise<number | undefined> {
  const INDEXER_URL =
    (globalThis as any)?.process?.env?.NOUNS_PONDER_URL ||
    (globalThis as any)?.process?.env?.NEXT_PUBLIC_NOUNS_PONDER_URL;
  if (!INDEXER_URL) return undefined;
  const query = `query AccountLeaderboard($cursor: String) {
    accounts(orderBy: "effectiveNounsBalance", orderDirection: "desc",
      where: { effectiveNounsBalance_gt: "100000000000000000000000" }, limit: 1000, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      items { address effectiveNounsBalance }
    }
  }`;
  const excluded = new Set(
    [
      "0x3154Cf16ccdb4C6d922629664174b904d80F2C35", // Base bridge
      "0x5c1760c98be951A4067DF234695c8014D8e7619C", // Nouns ERC20
      "0x830BD73E4184ceF73443C15111a1DF14e495C706", // Auction House
    ].map((a) => a.toLowerCase()),
  );
  let cursor: string | null | undefined = undefined;
  let total = 0;
  for (let i = 0; i < 20; i++) {
    const res = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { cursor } }),
      cache: 'no-store',
    });
    if (!res.ok) break;
    const json = await res.json();
    const data = json?.data;
    const items: { address: string }[] = data?.accounts?.items ?? [];
    total += items.filter((i: any) => !excluded.has(String(i.address).toLowerCase())).length;
    const pageInfo = data?.accounts?.pageInfo;
    if (pageInfo?.hasNextPage && pageInfo?.endCursor) cursor = pageInfo.endCursor; else break;
  }
  return total || undefined;
}

// Count nouns owned by a specific address (owner account), using the public subgraph.
// Mirrors nouns.com logic: treasury and ERC20 contract ownership.
export async function fetchNounsCountByOwner(owner: string): Promise<number> {
  const ownerLower = owner.toLowerCase();
  let skip = 0;
  const page = 1000;
  let total = 0;
  for (let i = 0; i < 50; i++) {
    const data = await gql<{ nouns: { id: string }[] }>(
      `query NounsByOwner($first:Int!,$skip:Int!,$owner:String!){
        nouns(first:$first, skip:$skip, where:{ owner_: { id: $owner }}) { id }
      }`,
      { first: page, skip, owner: ownerLower },
    );
    const count = data.nouns?.length ?? 0;
    total += count;
    if (count < page) break;
    skip += page;
  }
  return total;
}

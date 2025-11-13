import type {
  DirectoryQuery,
  TokenHolder,
  FetchHoldersResult,
  DirectoryDependencies,
  MoralisErc20HoldersResponse,
  MoralisNftOwnersResponse,
  MoralisErc20Holder,
  MoralisNftOwner,
} from "./types";
import { getMoralisChain, getMoralisChainFallbacks, ADDRESS_REGEX } from "./utils";

function ensureMoralisApiKey(): string {
  const apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error("MORALIS_API_KEY is not configured");
  }
  return apiKey;
}

export async function fetchMoralisTokenHolders(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<FetchHoldersResult> {
  const apiKey = ensureMoralisApiKey();
  const baseUrl = "https://deep-index.moralis.io/api/v2.2";
  const chainCandidates = getMoralisChainFallbacks(params.network);

  const holders: TokenHolder[] = [];
  let tokenDecimals: number | null = null;
  let tokenSymbol: string | null = null;
  const updatedAt: string = new Date().toISOString();
  let cursor: string | undefined;
  let chainIndex = 0;

  while (holders.length < params.pageSize) {
    const remaining = params.pageSize - holders.length;
    const url = new URL(
      `${baseUrl}/erc20/${params.contractAddress}/owners`,
    );
    url.searchParams.set("chain", chainCandidates[chainIndex] ?? getMoralisChain(params.network));
    url.searchParams.set("limit", String(Math.min(remaining, 100)));
    url.searchParams.set("order", "DESC");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await deps.fetchFn(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to fetch ERC20 holders (status ${response.status}): ${message}`,
      );
    }

    const payload = (await response.json()) as MoralisErc20HoldersResponse;
    const batch = Array.isArray(payload.result) ? payload.result : [];

    // Extract token metadata once if present
    if (tokenDecimals === null) {
      const dec =
        (typeof payload.decimals === "string"
          ? Number(payload.decimals)
          : payload.decimals) ??
        (typeof payload.token_decimals === "string"
          ? Number(payload.token_decimals)
          : payload.token_decimals) ??
        (typeof batch?.[0]?.decimals === "string"
          ? Number(batch?.[0]?.decimals)
          : (batch?.[0]?.decimals as number | null | undefined)) ??
        null;
      tokenDecimals = Number.isFinite(dec as number) ? (dec as number) : null;
    }

    if (tokenSymbol === null) {
      tokenSymbol =
        payload.symbol ?? payload.token_symbol ?? (batch?.[0]?.symbol ?? null) ?? null;
    }

    for (const entry of batch) {
      const address =
        entry.address ??
        (entry as any).holder_address ??
        entry.wallet_address ??
        entry.owner_address ??
        null;
      if (!address) continue;
      const raw =
        entry.balance ?? entry.total ?? entry.value ?? "0";
      const balanceStr = typeof raw === "number" ? String(raw) : (raw ?? "0");

      holders.push({
        ownerAddress: address,
        tokenBalances: [{ balance: balanceStr }],
      });
    }

    // Pagination
    cursor = (payload.cursor ?? payload.next ?? undefined) || undefined;
    if (!cursor) {
      // If we didn't get any results and there is another chain candidate, try it
      if (holders.length === 0 && chainIndex + 1 < chainCandidates.length) {
        chainIndex += 1;
        cursor = undefined;
        continue;
      }
      break;
    }
  }

  return {
    holders: holders.slice(0, params.pageSize),
    tokenDecimals,
    tokenSymbol,
    updatedAt,
  };
}

export async function fetchMoralisNftOwners(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<FetchHoldersResult> {
  const apiKey = ensureMoralisApiKey();
  const baseUrl = "https://deep-index.moralis.io/api/v2.2";
  const chainCandidates = getMoralisChainFallbacks(params.network);

  // Aggregate counts per owner
  const counts = new Map<string, bigint>();
  let tokenSymbol: string | null = null;
  const updatedAt: string = new Date().toISOString();
  let cursor: string | undefined;
  let chainIndex = 0;

  while (counts.size < params.pageSize) {
    const url = new URL(
      `${baseUrl}/nft/${params.contractAddress}/owners`,
    );
    url.searchParams.set("chain", chainCandidates[chainIndex] ?? getMoralisChain(params.network));
    url.searchParams.set("limit", String(100));
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await deps.fetchFn(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to fetch NFT owners (status ${response.status}): ${message}`,
      );
    }

    const payload = (await response.json()) as MoralisNftOwnersResponse;
    const batch = Array.isArray(payload.result) ? payload.result : [];

    if (tokenSymbol === null) {
      tokenSymbol = payload.symbol ?? (batch?.[0]?.symbol ?? null) ?? null;
    }

    for (const item of batch) {
      const owner = (item.owner_of ?? "").toLowerCase();
      if (!owner || !ADDRESS_REGEX.test(owner)) continue;
      const amountRaw = item.amount ?? "1";
      let amount: bigint = 1n;
      try {
        amount = BigInt(amountRaw);
      } catch {
        amount = 1n;
      }
      const prev = counts.get(owner) ?? 0n;
      counts.set(owner, prev + amount);
      if (counts.size >= params.pageSize) break;
    }

    cursor = (payload.cursor ?? payload.next ?? undefined) || undefined;
    if (!cursor) {
      // If no results and another chain candidate exists, try it
      if (counts.size === 0 && chainIndex + 1 < chainCandidates.length) {
        chainIndex += 1;
        cursor = undefined;
        continue;
      }
      break;
    }
  }

  const holders: TokenHolder[] = Array.from(counts.entries()).map(
    ([address, count]) => ({
      ownerAddress: address,
      tokenBalances: [{ balance: count.toString() }],
    }),
  );

  return {
    holders: holders.slice(0, params.pageSize),
    tokenDecimals: 0, // NFTs have 0 decimals for count-based balances
    tokenSymbol,
    updatedAt,
  };
}


import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { chunk } from "lodash";
import { formatUnits, type Address } from "viem";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import {
  getEnsName as wagmiGetEnsName,
  getEnsAvatar as wagmiGetEnsAvatar,
} from "wagmi/actions";
import { http } from "@wagmi/core";

import requestHandler, {
  type NounspaceResponse,
} from "@/common/data/api/requestHandler";
import neynar from "@/common/data/api/neynar";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import type { EtherScanChainName } from "@/constants/etherscanChainIds";
import { ALCHEMY_API } from "@/constants/urls";

const DIRECTORY_QUERY_SCHEMA = z.object({
  network: z.enum(["base", "polygon", "mainnet"]),
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/i, "Invalid contract address format"),
  pageSize: z.coerce.number().int().positive().max(500).default(200),
  // Whether to fetch ERC20 token holders or NFT owners
  assetType: z.enum(["token", "nft"]).default("token"),
});

const NEYNAR_LOOKUP_BATCH_SIZE = 25;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/i;

type DirectoryQuery = z.infer<typeof DIRECTORY_QUERY_SCHEMA>;
type DirectoryNetwork = DirectoryQuery["network"];

type AlchemyNftTokenBalance = {
  tokenId?: string | null;
  balance?: string | null;
};

// Generic holder record used internally regardless of source API
type AlchemyNftOwner = {
  ownerAddress?: string | null;
  tokenBalances?: AlchemyNftTokenBalance[] | null;
};

// Keep for reference in case we need to parse Alchemy responses again
type AlchemyNftOwnersResponse = {
  owners?: AlchemyNftOwner[] | null;
  ownerAddresses?: AlchemyNftOwner[] | null;
  pageKey?: string | null;
  totalCount?: number | string | null;
  contractMetadata?: {
    name?: string | null;
    symbol?: string | null;
    tokenType?: string | null;
  } | null;
};

type NeynarBulkUsersResponse = Awaited<
  ReturnType<typeof neynar.fetchBulkUsersByEthOrSolAddress>
>;

type NeynarUser = NeynarBulkUsersResponse extends Record<string, infer V>
  ? V extends Array<infer U>
    ? U
    : never
  : never;

type DirectoryMember = {
  address: string;
  balanceRaw: string;
  balanceFormatted: string;
  username?: string | null;
  displayName?: string | null;
  fid?: number | null;
  pfpUrl?: string | null;
  followers?: number | null;
  lastTransferAt?: string | null;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
};

type DirectoryFetchContext = {
  network: DirectoryNetwork;
  contractAddress: string;
  assetType: "token" | "nft";
};

type DirectoryApiResponse = {
  fetchedAt: string;
  members: DirectoryMember[];
  tokenSymbol: string | null;
  tokenDecimals: number | null;
  fetchContext: DirectoryFetchContext;
};

type DirectoryErrorResponse = {
  message: string;
};

type DirectoryDependencies = {
  fetchFn: typeof fetch;
  neynarClient: typeof neynar;
  getEnsNameFn: (address: Address) => Promise<string | null>;
  getEnsAvatarFn: (name: string) => Promise<string | null>;
};

let ensLookupConfig: ReturnType<typeof createConfig> | null = null;

function getEnsLookupConfig() {
  if (!ensLookupConfig) {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not configured");
    }

    ensLookupConfig = createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(`${ALCHEMY_API("eth")}v2/${apiKey}`),
      },
    });
  }

  return ensLookupConfig;
}

const defaultDependencies: DirectoryDependencies = {
  fetchFn: fetch,
  neynarClient: neynar,
  getEnsNameFn: (address) => wagmiGetEnsName(getEnsLookupConfig(), { address }),
  getEnsAvatarFn: (name) => wagmiGetEnsAvatar(getEnsLookupConfig(), { name }),
};

type EnsMetadata = {
  ensName: string | null;
  ensAvatarUrl: string | null;
};

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function isAddress(value: string): boolean {
  return ADDRESS_REGEX.test(value);
}

function extractOwnerAddress(owner: AlchemyNftOwner): string | null {
  if (typeof owner.ownerAddress === "string" && owner.ownerAddress) {
    return owner.ownerAddress;
  }
  return null;
}

function parseBalanceValue(value: string | null | undefined): bigint {
  if (!value) {
    return 0n;
  }

  try {
    if (value.startsWith("0x") || value.startsWith("0X")) {
      return BigInt(value);
    }
    return BigInt(value);
  } catch (error) {
    console.error("Unable to parse token balance", value, error);
    return 0n;
  }
}

function extractOwnerBalanceRaw(owner: AlchemyNftOwner): string {
  if (!Array.isArray(owner.tokenBalances) || owner.tokenBalances.length === 0) {
    return "0";
  }

  const total = owner.tokenBalances.reduce((sum, tokenBalance) => {
    return sum + parseBalanceValue(tokenBalance?.balance ?? null);
  }, 0n);

  return total.toString();
}

// Moralis helpers and types
function getMoralisChain(network: DirectoryNetwork): string {
  // Prefer hex chain IDs for widest Moralis compatibility
  switch (network) {
    case "mainnet":
      return "0x1"; // Ethereum mainnet
    case "polygon":
      return "0x89"; // Polygon mainnet
    case "base":
      return "0x2105"; // Base mainnet
    default:
      return "0x1";
  }
}

function getMoralisChainFallbacks(network: DirectoryNetwork): string[] {
  // Try both hex and named identifiers for resilience
  switch (network) {
    case "mainnet":
      return ["0x1", "eth"];
    case "polygon":
      return ["0x89", "polygon"];
    case "base":
      return ["0x2105", "base"];
    default:
      return ["0x1", "eth"];
  }
}

type MoralisErc20Holder = {
  // Common fields seen across Moralis responses
  address?: string | null;
  wallet_address?: string | null;
  owner_address?: string | null;
  balance?: string | number | null;
  total?: string | number | null;
  value?: string | number | null;
  decimals?: number | string | null;
  symbol?: string | null;
};

type MoralisErc20HoldersResponse = {
  result?: MoralisErc20Holder[] | null;
  cursor?: string | null;
  next?: string | null;
  page_size?: number | null;
  total?: number | null;
  // Sometimes included on response level
  decimals?: number | string | null;
  token_decimals?: number | string | null;
  symbol?: string | null;
  token_symbol?: string | null;
};

type MoralisNftOwner = {
  owner_of?: string | null;
  token_id?: string | null;
  amount?: string | null;
  // contract metadata sometimes available per record
  name?: string | null;
  symbol?: string | null;
};

type MoralisNftOwnersResponse = {
  result?: MoralisNftOwner[] | null;
  cursor?: string | null;
  next?: string | null;
  page_size?: number | null;
  // sometimes included
  name?: string | null;
  symbol?: string | null;
};

function ensureMoralisApiKey(): string {
  const apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error("MORALIS_API_KEY is not configured");
  }
  return apiKey;
}

async function fetchMoralisTokenHolders(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<{
  holders: AlchemyNftOwner[];
  tokenDecimals: number | null;
  tokenSymbol: string | null;
  updatedAt: string;
}> {
  const apiKey = ensureMoralisApiKey();
  const baseUrl = "https://deep-index.moralis.io/api/v2.2";
  const chainCandidates = getMoralisChainFallbacks(params.network);

  const holders: AlchemyNftOwner[] = [];
  let tokenDecimals: number | null = null;
  let tokenSymbol: string | null = null;
  const updatedAt: string = new Date().toISOString();
  let cursor: string | undefined;
  let chainIndex = 0;

  while (holders.length < params.pageSize) {
    const remaining = params.pageSize - holders.length;
    const url = new URL(
      `${baseUrl}/erc20/${params.contractAddress}/holders`,
    );
    url.searchParams.set("chain", chainCandidates[chainIndex] ?? getMoralisChain(params.network));
    url.searchParams.set("limit", String(Math.min(remaining, 100)));
    url.searchParams.set("order", "desc");
    url.searchParams.set("disable_total", "true");
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
        // reset cursor and try again with next chain id
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

async function fetchMoralisNftOwners(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<{
  holders: AlchemyNftOwner[];
  tokenDecimals: number | null;
  tokenSymbol: string | null;
  updatedAt: string;
}> {
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
      const amountRaw = item.amount ?? "1"; // default to 1 if not present
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

  const holders: AlchemyNftOwner[] = Array.from(counts.entries()).map(
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

async function fetchEnsMetadata(
  addresses: string[],
  deps: DirectoryDependencies,
): Promise<Record<string, EnsMetadata>> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    return {};
  }

  const uniqueAddresses = Array.from(
    new Set(
      addresses
        .map((address) => normalizeAddress(address))
        .filter((address) => isAddress(address)),
    ),
  );

  if (uniqueAddresses.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueAddresses.map(async (address) => {
      const viemAddress = address as Address;
      try {
        const ensName = await deps.getEnsNameFn(viemAddress);
        let ensAvatarUrl: string | null = null;

        if (ensName) {
          try {
            ensAvatarUrl = await deps.getEnsAvatarFn(ensName);
          } catch (avatarError) {
            console.error(
              `Failed to resolve ENS avatar for ${ensName}`,
              avatarError,
            );
          }
        }

        return [
          address,
          {
            ensName: ensName ?? null,
            ensAvatarUrl: ensAvatarUrl ?? null,
          },
        ] as const;
      } catch (error) {
        console.error(
          `Failed to resolve ENS metadata for address ${address}`,
          error,
        );
        return [
          address,
          {
            ensName: null,
            ensAvatarUrl: null,
          },
        ] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

function mapNeynarUsersByAddress(
  addressRecords: NeynarBulkUsersResponse,
): Record<string, NeynarUser | undefined> {
  return Object.fromEntries(
    Object.entries(addressRecords).map(([address, users]) => [
      normalizeAddress(address),
      Array.isArray(users) && users.length > 0 ? users[0] : undefined,
    ]),
  );
}

export async function fetchDirectoryData(
  params: DirectoryQuery,
  deps: DirectoryDependencies = defaultDependencies,
): Promise<DirectoryApiResponse> {
  const normalizedAddress = normalizeAddress(params.contractAddress);
  const { holders, tokenDecimals, tokenSymbol, updatedAt } =
    params.assetType === "nft"
      ? await fetchMoralisNftOwners(params, deps)
      : await fetchMoralisTokenHolders(params, deps);

  const addresses = holders
    .map((holder) => {
      const address = extractOwnerAddress(holder);
      return address ? normalizeAddress(address) : null;
    })
    .filter((value): value is string => Boolean(value));
  const uniqueAddresses = Array.from(new Set(addresses));

  let neynarProfiles: Record<string, NeynarUser | undefined> = {};
  if (process.env.NEYNAR_API_KEY) {
    const batches = chunk(uniqueAddresses, NEYNAR_LOOKUP_BATCH_SIZE);
    for (const batch of batches) {
      if (batch.length === 0) continue;
      try {
        const response = await deps.neynarClient.fetchBulkUsersByEthOrSolAddress({
          addresses: batch,
        });
        neynarProfiles = {
          ...neynarProfiles,
          ...mapNeynarUsersByAddress(response),
        };
      } catch (error) {
        console.error("Failed to fetch Neynar profiles", error);
      }
    }
  }

  let ensMetadata: Record<string, EnsMetadata> = {};
  const addressesMissingProfiles = uniqueAddresses.filter((address) => {
    const profile = neynarProfiles[address];
    return !profile || !("username" in profile) || !profile.username;
  });

  if (addressesMissingProfiles.length > 0) {
    ensMetadata = await fetchEnsMetadata(addressesMissingProfiles, deps);
  }

  let resolvedDecimals = tokenDecimals ?? null;
  if (resolvedDecimals === null) {
    try {
      const tokenData = await fetchTokenData(
        params.contractAddress,
        null,
        params.network as EtherScanChainName,
      );
      resolvedDecimals = tokenData?.decimals ?? null;
    } catch (error) {
      console.error("Unable to resolve token decimals", error);
    }
  }

  const members: DirectoryMember[] = [];
  for (const holder of holders) {
    const address = extractOwnerAddress(holder);
    if (!address) {
      continue;
    }

    const key = normalizeAddress(address);
    const profile = neynarProfiles[key];
    const balanceRaw = extractOwnerBalanceRaw(holder);
    let balanceFormatted = balanceRaw;

    const ensInfo = ensMetadata[key];

    if (resolvedDecimals !== null) {
      try {
        balanceFormatted = formatUnits(BigInt(balanceRaw), resolvedDecimals);
      } catch (error) {
        console.error("Failed to format token balance", error);
      }
    }

    members.push({
      address: key,
      balanceRaw,
      balanceFormatted,
      lastTransferAt: null,
      username: profile && "username" in profile ? profile.username ?? null : null,
      displayName:
        profile && "display_name" in profile
          ? (profile as { display_name?: string | null }).display_name ?? null
          : null,
      fid:
        profile && "fid" in profile ? (profile as { fid?: number }).fid ?? null : null,
      followers:
        profile && "follower_count" in profile
          ? (profile as { follower_count?: number | null }).follower_count ?? null
          : null,
      pfpUrl:
        profile &&
        typeof profile === "object" &&
        profile !== null &&
        "pfp_url" in profile
          ? (profile as { pfp_url?: string | null }).pfp_url ?? null
          : profile &&
              typeof profile === "object" &&
              profile !== null &&
              "profile" in profile
            ? (
                (profile as { profile?: { pfp_url?: string | null } }).profile?.pfp_url ??
                null
              )
            : null,
      ensName: ensInfo?.ensName ?? null,
      ensAvatarUrl: ensInfo?.ensAvatarUrl ?? null,
    });
  }

  return {
    fetchedAt: updatedAt,
    members,
    tokenSymbol: tokenSymbol ?? null,
    tokenDecimals: resolvedDecimals,
    fetchContext: {
      network: params.network,
      contractAddress: normalizedAddress,
      assetType: params.assetType,
    },
  };
}

const get = async (
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<DirectoryApiResponse, DirectoryErrorResponse>>,
) => {
  const parseResult = DIRECTORY_QUERY_SCHEMA.safeParse(req.query);

  if (!parseResult.success) {
    return res.status(400).json({
      result: "error",
      error: {
        message: parseResult.error.errors[0]?.message ?? "Invalid request parameters",
      },
    });
  }

  try {
    const data = await fetchDirectoryData(parseResult.data);

    return res.status(200).json({
      result: "success",
      value: data,
    });
  } catch (error) {
    console.error("Failed to build token directory", error);
    return res.status(500).json({
      result: "error",
      error: {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while generating the directory",
      },
    });
  }
};

export default requestHandler({
  get,
});

export { DIRECTORY_QUERY_SCHEMA };

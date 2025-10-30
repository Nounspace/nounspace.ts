import requestHandler from "@/common/data/api/requestHandler";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next/types";
import {
  type BalanceResponse,
  type BulkUsersResponse,
  type RelevantFungibleOwnersResponse,
  type User,
} from "@neynar/nodejs-sdk/build/api";

type DirectoryNetwork = "base" | "polygon" | "ethereum";

type DirectorySortBy = "tokenHoldings" | "followers" | "recentlyUpdated";

type DirectoryMember = {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  followerCount?: number;
  tokenBalance?: {
    units: string;
    formatted: string;
    symbol?: string;
    decimals?: number;
  };
  lastUpdatedAt?: string;
};

type DirectoryResponseBody = {
  members: DirectoryMember[];
  fetchedAt: string;
  network: DirectoryNetwork;
  contractAddress: string;
  token?: { symbol?: string; decimals?: number };
  sortBy: DirectorySortBy;
};

type ExtendedUser = User & {
  profile?: User["profile"] & {
    updated_at?: string;
    bio?: User["profile"]["bio"] & { updated_at?: string };
  };
  last_active?: string;
};

const NEYNAR_API_BASE_URL = "https://api.neynar.com/v2/farcaster";
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 75;

const NETWORK_ALIASES: Record<string, DirectoryNetwork> = {
  base: "base",
  "base-mainnet": "base",
  polygon: "polygon",
  "polygon-mainnet": "polygon",
  ethereum: "ethereum",
  "ethereum-mainnet": "ethereum",
  mainnet: "ethereum",
};

const SORT_ALIASES: Record<string, DirectorySortBy> = {
  tokenholdings: "tokenHoldings",
  "token-holdings": "tokenHoldings",
  "token_holdings": "tokenHoldings",
  "token holdings": "tokenHoldings",
  followers: "followers",
  "recentlyupdated": "recentlyUpdated",
  "recently-updated": "recentlyUpdated",
  "recently_updated": "recentlyUpdated",
  "recently updated": "recentlyUpdated",
};

const parseNetwork = (
  value: string | string[] | undefined,
): DirectoryNetwork | null => {
  if (!value) return null;
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate.trim().toLowerCase();
  return NETWORK_ALIASES[normalized] ?? null;
};

const parseSortBy = (
  value: string | string[] | undefined,
): DirectorySortBy => {
  if (!value) return "tokenHoldings";
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate.trim().toLowerCase();
  return SORT_ALIASES[normalized] ?? "tokenHoldings";
};

const parseLimit = (value: string | string[] | undefined): number => {
  if (!value) return DEFAULT_LIMIT;
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
};

const toLowerAddress = (address: string): string => address.trim().toLowerCase();

const DECIMAL_MAX = 30;
const decimalToUnits = (value: string | undefined, decimals: number): bigint => {
  if (!value) return 0n;
  if (!Number.isFinite(decimals) || decimals < 0) {
    decimals = 0;
  }
  const boundedDecimals = Math.min(decimals, DECIMAL_MAX);
  const [integerPartRaw, fractionPartRaw = ""] = value.split(".");
  const integerPart = integerPartRaw.replace(/[^0-9]/g, "");
  const sanitizedInteger = integerPart.length > 0 ? integerPart : "0";
  const paddedFraction = `${fractionPartRaw.replace(/[^0-9]/g, "")}${"0".repeat(boundedDecimals)}`;
  const fraction = paddedFraction.slice(0, boundedDecimals);
  const base = 10n ** BigInt(boundedDecimals);
  const integerUnits = BigInt(sanitizedInteger) * base;
  const fractionUnits = fraction.length > 0 ? BigInt(fraction) : 0n;
  return integerUnits + fractionUnits;
};

const formatBigIntWithSeparators = (value: bigint): string => {
  const raw = value.toString();
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatUnits = (units: bigint, decimals: number): string => {
  if (units === 0n) {
    return "0";
  }
  if (!Number.isFinite(decimals) || decimals < 0) {
    decimals = 0;
  }
  const boundedDecimals = Math.min(decimals, DECIMAL_MAX);
  const base = 10n ** BigInt(boundedDecimals);
  const integer = units / base;
  const remainder = units % base;
  const integerFormatted = formatBigIntWithSeparators(integer);
  if (remainder === 0n) {
    return integerFormatted;
  }
  const remainderString = remainder
    .toString()
    .padStart(boundedDecimals, "0")
    .slice(0, Math.min(boundedDecimals, 6))
    .replace(/0+$/, "");
  if (!remainderString) {
    return integerFormatted;
  }
  return `${integerFormatted}.${remainderString}`;
};

const extractLastUpdated = (user: ExtendedUser): string | undefined => {
  return (
    user.last_active ||
    user.profile?.updated_at ||
    user.profile?.bio?.updated_at
  );
};

const fetchRelevantOwners = async (
  headers: Record<string, string>,
  network: DirectoryNetwork,
  contractAddress: string,
  viewerFid?: string,
): Promise<User[]> => {
  const params: Record<string, string | number> = {
    contract_address: contractAddress,
    network,
  };
  if (viewerFid) {
    const parsedViewerFid = Number.parseInt(viewerFid, 10);
    if (!Number.isNaN(parsedViewerFid)) {
      params.viewer_fid = parsedViewerFid;
    }
  }

  const { data } = await axios.get<RelevantFungibleOwnersResponse>(
    `${NEYNAR_API_BASE_URL}/fungible/owner/relevant`,
    {
      headers,
      params,
    },
  );

  const hydrated = data.top_relevant_fungible_owners_hydrated ?? [];
  const dehydrated = data.all_relevant_fungible_owners_dehydrated ?? [];

  const merged = new Map<number, User>();
  hydrated.forEach((user) => {
    merged.set(user.fid, user);
  });
  dehydrated.forEach((user) => {
    if (!merged.has(user.fid)) {
      merged.set(user.fid, user);
    }
  });

  return Array.from(merged.values());
};

const hydrateUsersIfNecessary = async (
  users: User[],
  headers: Record<string, string>,
): Promise<User[]> => {
  const needsHydration = users.filter(
    (user) => typeof user.follower_count !== "number" || !user.pfp_url,
  );

  if (needsHydration.length === 0) {
    return users;
  }

  const fids = needsHydration.map((user) => user.fid).join(",");
  const { data } = await axios.get<BulkUsersResponse>(
    `${NEYNAR_API_BASE_URL}/user/bulk`,
    {
      headers,
      params: { fids },
    },
  );

  const replacements = new Map<number, User>();
  (data.users ?? []).forEach((user) => {
    replacements.set(user.fid, user);
  });

  return users.map((user) => replacements.get(user.fid) ?? user);
};

const fetchTokenBalanceForUser = async (
  headers: Record<string, string>,
  network: DirectoryNetwork,
  contractAddress: string,
  fid: number,
): Promise<{ units: bigint; formatted: string; symbol?: string; decimals?: number } | null> => {
  const { data } = await axios.get<BalanceResponse>(
    `${NEYNAR_API_BASE_URL}/user/balance`,
    {
      headers,
      params: {
        fid,
        networks: network,
      },
    },
  );

  const addressBalances = data.user_balance?.address_balances ?? [];
  if (addressBalances.length === 0) {
    return null;
  }

  const targetAddress = toLowerAddress(contractAddress);
  let totalUnits = 0n;
  let tokenSymbol: string | undefined;
  let tokenDecimals: number | undefined;

  addressBalances.forEach((balance) => {
    balance.token_balances?.forEach((tokenBalance) => {
      const tokenAddress = tokenBalance.token.address?.toLowerCase();
      if (!tokenAddress || tokenAddress !== targetAddress) {
        return;
      }
      const decimals = tokenBalance.token.decimals ?? tokenDecimals ?? 18;
      tokenDecimals = decimals;
      tokenSymbol = tokenBalance.token.symbol ?? tokenSymbol;
      const units = decimalToUnits(tokenBalance.balance?.in_token, decimals);
      totalUnits += units;
    });
  });

  if (tokenDecimals === undefined) {
    return null;
  }

  return {
    units: totalUnits,
    formatted: formatUnits(totalUnits, tokenDecimals),
    symbol: tokenSymbol,
    decimals: tokenDecimals,
  };
};

const compareBigIntDescending = (a: bigint, b: bigint): number => {
  if (a === b) return 0;
  return a > b ? -1 : 1;
};

const sortMembers = (
  members: DirectoryMember[],
  sortBy: DirectorySortBy,
): DirectoryMember[] => {
  const copy = [...members];
  switch (sortBy) {
    case "followers":
      copy.sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));
      break;
    case "recentlyUpdated":
      copy.sort((a, b) => {
        const aTimeRaw = a.lastUpdatedAt ? Date.parse(a.lastUpdatedAt) : 0;
        const bTimeRaw = b.lastUpdatedAt ? Date.parse(b.lastUpdatedAt) : 0;
        const aTime = Number.isNaN(aTimeRaw) ? 0 : aTimeRaw;
        const bTime = Number.isNaN(bTimeRaw) ? 0 : bTimeRaw;
        if (bTime === aTime) return 0;
        return bTime - aTime;
      });
      break;
    case "tokenHoldings":
    default:
      copy.sort((a, b) => {
        const aUnits = a.tokenBalance?.units ? BigInt(a.tokenBalance.units) : 0n;
        const bUnits = b.tokenBalance?.units ? BigInt(b.tokenBalance.units) : 0n;
        return compareBigIntDescending(aUnits, bUnits);
      });
      break;
  }

  return copy;
};

const directoryHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const network = parseNetwork(req.query.network);
  if (!network) {
    res.status(400).json({ error: "Invalid or missing network parameter" });
    return;
  }

  const contractAddressRaw = Array.isArray(req.query.contractAddress)
    ? req.query.contractAddress[0]
    : req.query.contractAddress;

  if (!contractAddressRaw || typeof contractAddressRaw !== "string") {
    res.status(400).json({ error: "Missing contractAddress parameter" });
    return;
  }

  const contractAddress = toLowerAddress(contractAddressRaw);

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "NEYNAR_API_KEY is not configured" });
    return;
  }

  const headers = {
    accept: "application/json",
    "x-api-key": apiKey,
  };

  const sortBy = parseSortBy(req.query.sortBy);
  const limit = parseLimit(req.query.limit);
  const viewerFid = Array.isArray(req.query.viewerFid)
    ? req.query.viewerFid[0]
    : req.query.viewerFid;

  try {
    const owners = await fetchRelevantOwners(headers, network, contractAddress, viewerFid);
    if (!owners.length) {
      res.status(200).json({
        members: [],
        fetchedAt: new Date().toISOString(),
        network,
        contractAddress,
        sortBy,
      });
      return;
    }

    const limitedOwners = owners.slice(0, limit);
    const hydratedOwners = await hydrateUsersIfNecessary(limitedOwners, headers);

    const members: DirectoryMember[] = [];
    let tokenSymbol: string | undefined;
    let tokenDecimals: number | undefined;

    for (const owner of hydratedOwners) {
      const balanceInfo = await fetchTokenBalanceForUser(
        headers,
        network,
        contractAddress,
        owner.fid,
      ).catch(() => null);

      if (balanceInfo) {
        tokenSymbol = tokenSymbol ?? balanceInfo.symbol;
        tokenDecimals = tokenDecimals ?? balanceInfo.decimals;
      }

      members.push({
        fid: owner.fid,
        username: owner.username,
        displayName: owner.display_name,
        pfpUrl: owner.pfp_url,
        followerCount: owner.follower_count,
        tokenBalance: balanceInfo
          ? {
              units: balanceInfo.units.toString(),
              formatted: balanceInfo.formatted,
              symbol: balanceInfo.symbol,
              decimals: balanceInfo.decimals,
            }
          : undefined,
        lastUpdatedAt: extractLastUpdated(owner as ExtendedUser),
      });
    }

    const sortedMembers = sortMembers(members, sortBy);

    res.status(200).json({
      members: sortedMembers,
      fetchedAt: new Date().toISOString(),
      network,
      contractAddress,
      token:
        tokenSymbol !== undefined || tokenDecimals !== undefined
          ? { symbol: tokenSymbol, decimals: tokenDecimals }
          : undefined,
      sortBy,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const message =
        (typeof responseData === "object" && responseData !== null
          ? (responseData as { message?: string; error?: string }).message ||
            (responseData as { message?: string; error?: string }).error
          : typeof responseData === "string"
            ? responseData
            : undefined) || error.message || "Failed to load token directory";

      res.status(error.response?.status ?? 500).json({ error: message });
      return;
    }

    const fallbackMessage =
      error instanceof Error ? error.message : "Failed to load token directory";
    res.status(500).json({ error: fallbackMessage });
  }
};

export default requestHandler({
  get: directoryHandler,
});

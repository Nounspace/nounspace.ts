import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { chunk } from "lodash";
import { formatUnits } from "viem";

import requestHandler, {
  type NounspaceResponse,
} from "@/common/data/api/requestHandler";
import neynar from "@/common/data/api/neynar";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import type { EtherScanChainName } from "@/constants/etherscanChainIds";

const DIRECTORY_QUERY_SCHEMA = z.object({
  network: z.enum(["base", "polygon", "mainnet"]),
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/i, "Invalid contract address format"),
  pageSize: z.coerce.number().int().positive().max(500).default(200),
});

const ALCHEMY_BASE_URL = "https://api.g.alchemy.com/data/v1";
const ALCHEMY_NETWORK_SLUGS: Record<DirectoryNetwork, string> = {
  base: "base-mainnet",
  polygon: "polygon-mainnet",
  mainnet: "eth-mainnet",
};
const NEYNAR_LOOKUP_BATCH_SIZE = 25;

type DirectoryQuery = z.infer<typeof DIRECTORY_QUERY_SCHEMA>;
type DirectoryNetwork = DirectoryQuery["network"];

type AlchemyTokenBalanceObject = {
  tokenBalance?: string;
  balance?: string;
  value?: string;
};

type AlchemyTokenHolder = {
  address?: string;
  holderAddress?: string;
  tokenBalance?: string | AlchemyTokenBalanceObject | null;
  lastUpdatedBlockTimestamp?: string | null;
  lastUpdatedBlock?: string | null;
  acquiredAt?: string | null;
};

type AlchemyTokenHolderPayload = {
  tokenBalances?: AlchemyTokenHolder[];
  holders?: AlchemyTokenHolder[];
  pageKey?: string | null;
  tokenDecimals?: number | string | null;
  tokenSymbol?: string | null;
  lastUpdated?: string | null;
  lastUpdatedBlockTimestamp?: string | null;
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
};

type DirectoryFetchContext = {
  network: DirectoryNetwork;
  contractAddress: string;
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
};

const defaultDependencies: DirectoryDependencies = {
  fetchFn: fetch,
  neynarClient: neynar,
};

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractTokenBalances(payload: unknown): AlchemyTokenHolderPayload {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if (
    "result" in payload &&
    payload.result &&
    typeof payload.result === "object" &&
    !Array.isArray(payload.result)
  ) {
    return extractTokenBalances(payload.result);
  }

  const record = payload as AlchemyTokenHolderPayload;
  return record;
}

function extractHolderAddress(holder: AlchemyTokenHolder): string | null {
  if (typeof holder.holderAddress === "string") {
    return holder.holderAddress;
  }
  if (typeof holder.address === "string") {
    return holder.address;
  }
  return null;
}

function extractBalanceRaw(balance: AlchemyTokenHolder["tokenBalance"]): string {
  if (typeof balance === "string" && balance) {
    return balance;
  }
  if (balance && typeof balance === "object") {
    if ("tokenBalance" in balance && typeof balance.tokenBalance === "string") {
      return balance.tokenBalance;
    }
    if ("balance" in balance && typeof balance.balance === "string") {
      return balance.balance;
    }
    if ("value" in balance && typeof balance.value === "string") {
      return balance.value;
    }
  }
  return "0";
}

async function fetchAlchemyTokenHolders(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<{
  holders: AlchemyTokenHolder[];
  tokenDecimals: number | null;
  tokenSymbol: string | null;
  updatedAt: string;
}> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not configured");
  }

  const chainSlug = ALCHEMY_NETWORK_SLUGS[params.network];
  const url = `${ALCHEMY_BASE_URL}/${chainSlug}/token/holders`;

  const holders: AlchemyTokenHolder[] = [];
  let tokenDecimals: number | null = null;
  let tokenSymbol: string | null = null;
  let updatedAt: string = new Date().toISOString();
  let pageKey: string | undefined;

  while (holders.length < params.pageSize) {
    const remaining = params.pageSize - holders.length;
    const requestBody: Record<string, unknown> = {
      contractAddress: params.contractAddress,
      pageKey,
      limit: Math.min(remaining, 100),
      order: "desc",
    };

    if (!requestBody.pageKey) {
      delete requestBody.pageKey;
    }

    const response = await deps.fetchFn(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Alchemy-Token": apiKey,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to fetch token holders (status ${response.status}): ${message}`,
      );
    }

    const json = await response.json();
    const payload = extractTokenBalances(json);

    const batch = Array.isArray(payload.tokenBalances)
      ? payload.tokenBalances
      : Array.isArray(payload.holders)
        ? payload.holders
        : [];

    holders.push(...batch);

    if (tokenDecimals === null) {
      tokenDecimals = coerceNumber(payload.tokenDecimals);
    }
    if (tokenSymbol === null && typeof payload.tokenSymbol === "string") {
      tokenSymbol = payload.tokenSymbol;
    }
    if (typeof payload.lastUpdatedBlockTimestamp === "string") {
      updatedAt = payload.lastUpdatedBlockTimestamp;
    } else if (typeof payload.lastUpdated === "string") {
      updatedAt = payload.lastUpdated;
    }

    pageKey =
      typeof payload.pageKey === "string" && payload.pageKey.length > 0
        ? payload.pageKey
        : undefined;

    if (!pageKey) {
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
    await fetchAlchemyTokenHolders(params, deps);

  const addresses = holders
    .map((holder) => {
      const address = extractHolderAddress(holder);
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
    const address = extractHolderAddress(holder);
    if (!address) {
      continue;
    }

    const key = normalizeAddress(address);
    const profile = neynarProfiles[key];
    const balanceRaw = extractBalanceRaw(holder.tokenBalance);
    let balanceFormatted = balanceRaw;

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
      lastTransferAt:
        holder.lastUpdatedBlockTimestamp ??
        holder.acquiredAt ??
        holder.lastUpdatedBlock ??
        null,
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

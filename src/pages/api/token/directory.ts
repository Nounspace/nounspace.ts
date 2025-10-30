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

const ALCHEMY_NFT_BASE_URLS: Record<DirectoryNetwork, string> = {
  base: "https://base-mainnet.g.alchemy.com",
  polygon: "https://polygon-mainnet.g.alchemy.com",
  mainnet: "https://eth-mainnet.g.alchemy.com",
};
const NEYNAR_LOOKUP_BATCH_SIZE = 25;

type DirectoryQuery = z.infer<typeof DIRECTORY_QUERY_SCHEMA>;
type DirectoryNetwork = DirectoryQuery["network"];

type AlchemyNftTokenBalance = {
  tokenId?: string | null;
  balance?: string | null;
};

type AlchemyNftOwner = {
  ownerAddress?: string | null;
  tokenBalances?: AlchemyNftTokenBalance[] | null;
};

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

async function fetchAlchemyTokenHolders(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<{
  holders: AlchemyNftOwner[];
  tokenDecimals: number | null;
  tokenSymbol: string | null;
  updatedAt: string;
}> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not configured");
  }

  const baseUrl = ALCHEMY_NFT_BASE_URLS[params.network];
  const endpoint = `${baseUrl}/nft/v3/${apiKey}/getOwnersForContract`;

  const holders: AlchemyNftOwner[] = [];
  const tokenDecimals: number | null = 0;
  let tokenSymbol: string | null = null;
  const updatedAt: string = new Date().toISOString();
  let pageKey: string | undefined;

  while (holders.length < params.pageSize) {
    const remaining = params.pageSize - holders.length;
    const url = new URL(endpoint);
    url.searchParams.set("contractAddress", params.contractAddress);
    url.searchParams.set("withTokenBalances", "true");
    url.searchParams.set("pageSize", String(Math.min(remaining, 100)));
    if (pageKey) {
      url.searchParams.set("pageKey", pageKey);
    }

    const response = await deps.fetchFn(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Alchemy-Token": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Failed to fetch token holders (status ${response.status}): ${message}`,
      );
    }

    const payload = (await response.json()) as AlchemyNftOwnersResponse;
    const batch = Array.isArray(payload.owners)
      ? payload.owners
      : Array.isArray(payload.ownerAddresses)
        ? payload.ownerAddresses
        : [];

    holders.push(...batch);

    if (
      tokenSymbol === null &&
      payload.contractMetadata &&
      typeof payload.contractMetadata === "object" &&
      payload.contractMetadata !== null &&
      typeof payload.contractMetadata.symbol === "string"
    ) {
      tokenSymbol = payload.contractMetadata.symbol;
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

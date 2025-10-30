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

const NETWORK_CHAIN_IDS: Record<DirectoryNetwork, number> = {
  base: 8453,
  polygon: 137,
  mainnet: 1,
};

const COVALENT_BASE_URL = "https://api.covalenthq.com/v1";
const COVALENT_BATCH_SIZE = 25;

type DirectoryQuery = z.infer<typeof DIRECTORY_QUERY_SCHEMA>;
type DirectoryNetwork = DirectoryQuery["network"];

type CovalentTokenHolder = {
  address: string;
  balance: string;
  balance_24h?: string | null;
  quote?: number | null;
  pretty_quote?: string | null;
  last_transferred_at?: string | null;
};

type CovalentTokenHolderResponse = {
  data?: {
    updated_at?: string;
    contract_ticker_symbol?: string | null;
    contract_decimals?: number | null;
    items?: CovalentTokenHolder[];
  };
  error?: boolean;
  error_message?: string;
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
  balanceQuoteUSD?: number | null;
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

async function fetchCovalentTokenHolders(
  params: DirectoryQuery,
  deps: DirectoryDependencies,
): Promise<{
  holders: CovalentTokenHolder[];
  tokenDecimals: number | null;
  tokenSymbol: string | null;
  updatedAt: string;
}> {
  const apiKey = process.env.COVALENT_API_KEY;
  if (!apiKey) {
    throw new Error("COVALENT_API_KEY is not configured");
  }

  const chainId = NETWORK_CHAIN_IDS[params.network];
  const url = new URL(
    `${COVALENT_BASE_URL}/${chainId}/tokens/${params.contractAddress}/token_holders_v2/`,
  );
  url.searchParams.set("page-size", params.pageSize.toString());

  const response = await deps.fetchFn(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to fetch token holders (status ${response.status}): ${message}`,
    );
  }

  const json = (await response.json()) as CovalentTokenHolderResponse;
  if (json.error) {
    throw new Error(json.error_message || "Covalent returned an error response");
  }

  const holders = json.data?.items ?? [];
  const updatedAt = json.data?.updated_at ?? new Date().toISOString();

  return {
    holders,
    tokenDecimals: json.data?.contract_decimals ?? null,
    tokenSymbol: json.data?.contract_ticker_symbol ?? null,
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
    await fetchCovalentTokenHolders(params, deps);

  const addresses = holders.map((holder) => normalizeAddress(holder.address));
  const uniqueAddresses = Array.from(new Set(addresses));

  let neynarProfiles: Record<string, NeynarUser | undefined> = {};
  if (process.env.NEYNAR_API_KEY) {
    const batches = chunk(uniqueAddresses, COVALENT_BATCH_SIZE);
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

  const members: DirectoryMember[] = holders.map((holder) => {
    const key = normalizeAddress(holder.address);
    const profile = neynarProfiles[key];
    const balanceRaw = holder.balance ?? "0";
    let balanceFormatted = balanceRaw;

    if (resolvedDecimals !== null) {
      try {
        balanceFormatted = formatUnits(BigInt(balanceRaw), resolvedDecimals);
      } catch (error) {
        console.error("Failed to format token balance", error);
      }
    }

    return {
      address: key,
      balanceRaw,
      balanceFormatted,
      balanceQuoteUSD: holder.quote ?? null,
      lastTransferAt: holder.last_transferred_at ?? null,
      username: profile && "username" in profile ? profile.username ?? null : null,
      displayName:
        profile && "display_name" in profile
          ? (profile as { display_name?: string | null }).display_name ?? null
          : null,
      fid: profile && "fid" in profile ? (profile as { fid?: number }).fid ?? null : null,
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
    };
  });

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

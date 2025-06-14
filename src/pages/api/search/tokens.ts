import { NextApiRequest, NextApiResponse } from "next/types";
import { z, ZodSchema } from "zod";
import requestHandler, { NounspaceResponse } from "@/common/data/api/requestHandler";

interface TokenResult {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  contractAddress: string;
  network: string;
}

const QuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().positive().max(10).default(5),
});

type TokenSearchResult = {
  tokens: TokenResult[];
};

const _validateQueryParams = <T extends ZodSchema>(
  req: NextApiRequest,
  schema: T,
): [z.infer<T> | null, string | null] => {
  const parseResult = schema.safeParse(req.query);

  if (parseResult.success) {
    return [parseResult.data, null];
  }

  const error = parseResult.error.errors[0];
  const errorMessage = `${error.message} (${error.path.join(".")})`;
  return [null, errorMessage];
};

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchTokenByAddress(address: string): Promise<TokenResult | null> {
  const url = `${COINGECKO_BASE_URL}/coins/ethereum/contract/${address}`;
  const res = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY ?? "",
    },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const platformId: string = json.asset_platform_id || "ethereum";
  const platforms: Record<string, string> = json.platforms || {};
  const contractAddress =
    platforms[platformId] || platforms.ethereum || Object.values(platforms)[0];
  if (!contractAddress) return null;
  return {
    id: json.id,
    name: json.name,
    symbol: json.symbol,
    image: json.image?.thumb || null,
    contractAddress,
    network: platformId === "ethereum" ? "mainnet" : platformId.replace("polygon-pos", "polygon"),
  };
}

async function fetchTokensByQuery(query: string, limit: number): Promise<TokenResult[]> {
  const params = new URLSearchParams({ query });
  const searchRes = await fetch(`${COINGECKO_BASE_URL}/search?${params.toString()}`, {
    headers: {
      "x-cg-demo-api-key": process.env.COINGECKO_API_KEY ?? "",
    },
  });
  if (!searchRes.ok) return [];
  const searchJson = await searchRes.json();
  const coins = Array.isArray(searchJson.coins) ? searchJson.coins.slice(0, limit) : [];
  const results: TokenResult[] = [];
  for (const coin of coins) {
    const detailRes = await fetch(`${COINGECKO_BASE_URL}/coins/${coin.id}`, {
      headers: {
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY ?? "",
      },
    });
    if (!detailRes.ok) continue;
    const json = await detailRes.json();
    const platformId: string = json.asset_platform_id || "ethereum";
    const platforms: Record<string, string> = json.platforms || {};
    const contractAddress =
      platforms[platformId] || platforms.ethereum || Object.values(platforms)[0];
    if (!contractAddress) continue;
    results.push({
      id: json.id,
      name: json.name,
      symbol: json.symbol,
      image: json.image?.thumb || null,
      contractAddress,
      network: platformId === "ethereum" ? "mainnet" : platformId.replace("polygon-pos", "polygon"),
    });
    if (results.length >= limit) break;
  }
  return results;
}

const get = async (
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<TokenSearchResult>>,
) => {
  const [params, errorMessage] = _validateQueryParams(req, QuerySchema);

  if (errorMessage) {
    return res.status(400).json({ result: "error", error: { message: errorMessage } });
  }

  try {
    const { q, limit } = params!;
    let tokens: TokenResult[] = [];
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      const token = await fetchTokenByAddress(q);
      if (token) tokens = [token];
    } else {
      tokens = await fetchTokensByQuery(q, limit);
    }
    return res.status(200).json({ result: "success", value: { tokens } });
  } catch (err) {
    return res.status(500).json({
      result: "error",
      error: { message: err instanceof Error ? err.message : "Unknown error" },
    });
  }
};

export default requestHandler({ get });

export { TokenResult };

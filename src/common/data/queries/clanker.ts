import { Address } from "viem";

export interface ClankerToken {
  id: number;
  created_at: string;
  tx_hash: string;
  contract_address: string;
  requestor_fid: number | null;
  name: string;
  symbol: string;
  img_url: string;
  pool_address: string;
  cast_hash: string | null;
  type: "clanker_v2" | null;
  pair: string | null;
}

const CLANKER_API_URL = `https://www.clanker.world/api/get-clanker-by-address`;

export async function fetchClankerByAddress(
  address: Address,
): Promise<ClankerToken | null> {
  try {
    console.log("Fetching Clanker by address:", address);
    const response = await fetch(`${CLANKER_API_URL}?address=${address}`, {
      headers: {
        "x-api-key": process.env.CLANKER_API_KEY!,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch data:", response.statusText, json);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    console.log("Clanker data:", json.data);
    return json.data as ClankerToken;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return null;
  }
}

import { Address } from "viem";
import { OwnerType } from "../api/etherscan";
import { fetchEmpireByAddress } from "./empireBuilder";

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
    // console.log("Fetching Clanker by address:", address);
    const response = await fetch(`${CLANKER_API_URL}?address=${address}`, {
      headers: {
        "x-api-key": process.env.CLANKER_API_KEY!,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return json.data as ClankerToken;
  } catch (error) {
    // console.log(
    //   "Failed to fetch Clanker data:",
    //   error instanceof Error ? error.message : error,
    // );
    return null;
  }
}

export async function tokenRequestorFromContractAddress(
  contractAddress: string,
) {
  // First check if it's a Clanker token
  const clankerData = await fetchClankerByAddress(contractAddress as Address);
  
  if (clankerData && clankerData.requestor_fid) {
    return {
      ownerId: String(clankerData.requestor_fid),
      ownerIdType: "fid" as OwnerType,
    };
  }

  // If not a Clanker token, check if it's an Empire token
  const empireData = await fetchEmpireByAddress(contractAddress as Address);
  
  if (empireData && empireData.owner) {
    return {
      ownerId: empireData.owner,
      ownerIdType: "address" as OwnerType,
    };
  }

  return {
    ownerId: undefined,
    ownerIdType: "fid" as OwnerType,
  };
}

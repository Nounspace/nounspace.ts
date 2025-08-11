import { Address } from "viem";
import { OwnerType } from "../api/etherscan";
import neynar from "../api/neynar";
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
    console.log("Clanker response:", json);

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
  const [clankerData, empireData] = await Promise.all([
    fetchClankerByAddress(contractAddress as Address),
    fetchEmpireByAddress(contractAddress as Address),
  ]);

  console.log("tokenRequestorFromContractAddress data:", {
    clankerData,
    empireData,
  });

  if (empireData && empireData.owner) {
    let ownerId: string = empireData.owner.toLowerCase();
    let ownerIdType: OwnerType = "address";

    if (process.env.NEYNAR_API_KEY) {
      try {
        const addresses = [ownerId];
        const users = await neynar.fetchBulkUsersByEthOrSolAddress({ addresses });
        console.log("Neynar response:", users);
        const user = users[ownerId]?.[0];
        if (user?.fid) {
          ownerId = String(user.fid);
          ownerIdType = "fid";
        }
      } catch (error) {
        console.error("Error fetching owner FID:", error);
      }
    } else {
      console.error("NEYNAR_API_KEY is not set");
    }

    return { ownerId, ownerIdType };
  }

  if (clankerData && clankerData.requestor_fid) {
    return {
      ownerId: String(clankerData.requestor_fid),
      ownerIdType: "fid" as OwnerType,
    };
  }

  return {
    ownerId: undefined,
    ownerIdType: "fid" as OwnerType,
  };
}

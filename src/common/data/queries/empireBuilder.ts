import { Address } from "viem";

export interface EmpireToken {
  id: number;
  base_token: string;
  name: string;
  owner: string;
  token_symbol: string;
  token_name: string;
}

const EMPIRE_API_URL = "https://empirebuilder.world/api/empires";

export async function fetchEmpireByAddress(
  address: Address,
): Promise<EmpireToken | null> {
  try {
    const response = await fetch(`${EMPIRE_API_URL}/${address}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();

    return json.empires && json.empires.length > 0
      ? (json.empires[0] as EmpireToken)
      : null;
  } catch (_error) {
    return null;
  }
}

import { CHAIN_CONFIG } from "@nouns/config";
import { SECONDS_PER_DAY } from "@nouns/utils/constants";
import sha256 from "sha256";

function getNftId(id: string): string {
  const k = CHAIN_CONFIG.addresses.nounsToken.toLowerCase() + ":" + id;
  return "0x" + sha256(k).toLowerCase();
}

export async function getNogsForNoun(nounId: string): Promise<number | null> {
  const id = getNftId(nounId);

  try {
    const resp = await fetch(
      `https://chdjnapukivywlhuzorn.supabase.co/rest/v1/nft_rewards?select=*&id=in.%28${id}%29`,
      {
        headers: { apikey: process.env.NOGS_API_KEY! },
        next: {
          revalidate: SECONDS_PER_DAY,
        },
      },
    );
    const data = (await resp.json())?.[0] as
      | { unlocked_reward?: number; claimed_reward?: number }
      | undefined;

    if (
      data?.unlocked_reward != undefined &&
      data?.claimed_reward != undefined
    ) {
      return data.unlocked_reward - data.claimed_reward;
    } else {
      console.error("Error getNogsForNoun, invalid data returned: ", data);
      return null;
    }
  } catch (e) {
    console.error("Error getNogsForNoun: ", e);
    return null;
  }
}

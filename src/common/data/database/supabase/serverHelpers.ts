import { map } from "lodash";
import supabaseClient from "./clients/server";

export async function loadOnwingIdentitiesForAddress(walletAddress: string) {
  const { data } = await supabaseClient
    .from("walletIdentities")
    .select("identityPublicKey")
    .eq("walletAddress", walletAddress);
  return map(data, "identityPublicKey");
}

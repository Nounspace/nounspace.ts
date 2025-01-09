import { isNil, map } from "lodash";
import supabaseClient from "./clients/server";
import { contractOwnerFromContractAddress } from "../../api/etherscan";

export async function loadOwnedItentitiesForWalletAddress(
  walletAddress: string,
) {
  const { data } = await supabaseClient
    .from("walletIdentities")
    .select("identityPublicKey")
    .eq("walletAddress", walletAddress);
  return map(data, "identityPublicKey");
}

export async function loadIdentitiesOwningContractSpace(
  contractAddress: string,
) {
  const { ownerId, ownerIdType } =
    await contractOwnerFromContractAddress(contractAddress);
  if (isNil(ownerId)) return [];
  if (ownerIdType === "address") {
    return await loadOwnedItentitiesForWalletAddress(ownerId);
  } else {
    return await loadOwnedItentitiesForFid(ownerId);
  }
}

export async function loadOwnedItentitiesForFid(fid: string) {
  const { data } = await supabaseClient
    .from("fidRegistrations")
    .select(`identityPublicKey`)
    .eq("fid", fid);

  return data === null ? [] : map(data, (d) => d.identityPublicKey);
}

export async function loadOwnedItentitiesForSpaceByFid(spaceId: string) {
  const { data } = await supabaseClient
    .from("fidRegistrations")
    .select(
      `
      fid,
      identityPublicKey,
      spaceRegistrations!inner (
        fid
      )`,
    )
    .eq("spaceRegistrations.spaceId", spaceId);

  return data === null ? [] : map(data, (d) => d.identityPublicKey);
}

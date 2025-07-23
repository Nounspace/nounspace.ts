import { isNil, map } from "lodash";
import createSupabaseServerClient from "./clients/server";
import { contractOwnerFromContractAddress } from "../../api/etherscan";
import { tokenRequestorFromContractAddress } from "../../queries/clanker";

export async function loadOwnedItentitiesForWalletAddress(
  walletAddress: string,
  network?: string,
) {
  const { data } = await createSupabaseServerClient()
    .from("walletIdentities")
    .select("identityPublicKey")
    .ilike("walletAddress", walletAddress.toLowerCase());
  return map(data, "identityPublicKey");
}

export async function loadIdentitiesOwningContractSpace(
  contractAddress: string,
  network: string,
) {
  // Fetch the owner of the contract from Clanker
  let { ownerId, ownerIdType } =
    await tokenRequestorFromContractAddress(contractAddress);

  // Load the owner of the contract from Etherscan if not found
  if (isNil(ownerId)) {
    ({ ownerId, ownerIdType } =
      await contractOwnerFromContractAddress(contractAddress, network));
  }

  // If the owner is still not found, return an empty array
  if (isNil(ownerId)) return [];

  // Load the identities owned by the owner
  if (ownerIdType === "address") {
    return await loadOwnedItentitiesForWalletAddress(ownerId);
  } else {
    return await loadOwnedItentitiesForFid(ownerId);
  }
}

export async function loadOwnedItentitiesForFid(fid: string) {
  const { data } = await createSupabaseServerClient()
    .from("fidRegistrations")
    .select(`identityPublicKey`)
    .eq("fid", +fid);

  return data === null ? [] : map(data, (d) => d.identityPublicKey);
}

export async function loadOwnedItentitiesForSpaceByFid(spaceId: string) {
  const { data } = await createSupabaseServerClient()
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

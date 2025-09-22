"use server";
import { Address, isAddressEqual } from "viem";
import { Noun } from "./types";
import { getAllNounsUncached } from "./getAllNouns";

export async function getNounsForAddress(address: Address): Promise<Noun[]> {
  const allNouns = await getAllNounsUncached();
  const nounsForAddress = allNouns.filter((noun) => isAddressEqual(noun.owner, address));

  return nounsForAddress;
}

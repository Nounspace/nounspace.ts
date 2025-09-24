"use server";
import { Address, isAddressEqual } from "viem";
import { CHAIN_CONFIG } from "@nouns/config";
import { multicall, readContract } from "viem/actions";
import { nounsNftTokenConfig } from "../generated/wagmi";
import { BigIntString } from "@nouns/utils/types";

export async function getDoesNounRequireApproval(nounId: BigIntString, spender: Address): Promise<boolean> {
  const currentApprovalAddress = await readContract(CHAIN_CONFIG.publicClient, {
    address: nounsNftTokenConfig.address,
    abi: nounsNftTokenConfig.abi,
    functionName: "getApproved",
    args: [BigInt(nounId)],
  });

  return currentApprovalAddress !== spender;
}

export async function getDoesNounRequireApprovalAndIsOwner(
  nounId: BigIntString,
  owner: Address,
  spender: Address
): Promise<boolean> {
  const [actualOwner, currentApprovalAddress] = await multicall(CHAIN_CONFIG.publicClient, {
    contracts: [
      {
        address: nounsNftTokenConfig.address,
        abi: nounsNftTokenConfig.abi,
        functionName: "ownerOf",
        args: [BigInt(nounId)],
      },
      {
        address: nounsNftTokenConfig.address,
        abi: nounsNftTokenConfig.abi,
        functionName: "getApproved",
        args: [BigInt(nounId)],
      },
    ],
    allowFailure: false,
  });

  return !isAddressEqual(spender, currentApprovalAddress) && isAddressEqual(actualOwner, owner);
}

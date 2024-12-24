import { AlchemyProvider } from "ethers/providers";
import { Interface } from "ethers/abi";
import { Contract } from "ethers/contract";

export type OwnerType = "address" | "fid";

export const baseProvider = new AlchemyProvider(
  "base",
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
);

export async function loadEthersContract(
  provider: AlchemyProvider,
  contractAddress: string,
) {
  const abi = await provider.getCode(contractAddress);
  return new Contract(contractAddress, new Interface(abi));
}

export async function contractOwnerFromContract(contract: Contract) {
  let ownerId: string | undefined = "";
  let ownerIdType: OwnerType = "address";
  const abi = contract.interface;
  if (abi.hasFunction("fid")) {
    ownerId = (await contract.fid()) as string;
    ownerIdType = "fid" as OwnerType;
  } else if (abi.hasFunction("owner")) {
    ownerId = (await contract.owner()) as string;
  } else if (abi.hasFunction("deployer")) {
    ownerId = (await contract.deployer()) as string;
  } else {
    // Finally use contract creator address as a fall back
    ownerId = contract.deploymentTransaction()?.from;
  }

  return {
    ownerId,
    ownerIdType,
  };
}

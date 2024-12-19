import { AlchemyProvider } from "ethers/providers";
import { Interface } from "ethers/abi";
import { Contract } from "ethers/contract";

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

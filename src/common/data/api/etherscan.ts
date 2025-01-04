import { EtherScanChains } from "@/constants/etherscanChainIds";
import axios from "axios";
import { Contract, Interface } from "ethers";
import { AlchemyProvider, Provider } from "ethers/providers";
import { filter } from "lodash";

export type OwnerType = "address" | "fid";

interface ContractAbi {
  type: string;
  name?: string;
  inputs?: Array<{
    name: string;
    type: string;
    indexed?: boolean;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: string; // ABI comes as a string that needs to be parsed
}

export const baseProvider = new AlchemyProvider(
  "base",
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
);

async function getContractABI(
  contractAddress: string,
  network: EtherScanChains,
): Promise<ContractAbi[]> {
  // Select the appropriate API endpoint based on network
  const baseUrl = "https://api.etherscan.io";

  const apiKey = process.env.ETHERSCAN_API_KEY!;

  try {
    const { data } = await axios.get<EtherscanResponse>(`${baseUrl}/v2/api`, {
      params: {
        module: "contract",
        action: "getabi",
        address: contractAddress,
        apikey: apiKey,
        chainId: network,
      },
    });

    if (data.status === "0") {
      throw new Error(`Etherscan API error: ${data.message}, ${data.result}`);
    }

    // Etherscan returns the ABI as a string, so we need to parse it
    const abi = JSON.parse(data.result) as ContractAbi[];
    return abi;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Error fetching ABI from Etherscan:", error);
    }
    throw error;
  }
}

async function getViewOnlyContractABI(
  contractAddress: string,
  network: EtherScanChains,
): Promise<ContractAbi[]> {
  const abiUnfiltered = await getContractABI(contractAddress, network);
  return filter(
    abiUnfiltered,
    (abiItem) =>
      abiItem.type === "function" && abiItem.stateMutability === "view",
  );
}

export async function loadEthersViewOnlyContract(
  contractAddress: string,
  network: EtherScanChains = EtherScanChains.base,
  provider: Provider = baseProvider,
) {
  try {
    const abi = await getViewOnlyContractABI(contractAddress, network);
    return new Contract(contractAddress, new Interface(abi), provider);
  } catch (e) {
    return undefined;
  }
}

export async function contractOwnerFromContract(contract) {
  let ownerId: string | undefined = "";
  let ownerIdType: OwnerType = "address";
  const abi = contract.interface;
  if (abi.hasFunction("fid")) {
    ownerId = Number(await contract.fid()).toString();
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

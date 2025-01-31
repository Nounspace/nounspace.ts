import { EtherScanChains } from "@/constants/etherscanChainIds";
import axios from "axios";
import { Contract, Interface } from "ethers";
import { AlchemyProvider, Provider } from "ethers/providers";
import { filter, isUndefined } from "lodash";
import neynar from "./neynar";

export type OwnerType = "address" | "fid";

interface ContractCreation {
  contractAddress: string;
  contractCreator: string;
  txHash: string;
  blockNumber: string;
  timeStamp: string;
  contractFactory: string;
  creationByteCode: string;
}

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
  result: unknown; // ABI comes as a string that needs to be parsed
}

export const baseProvider = new AlchemyProvider(
  "base",
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
);

async function getContractABI(
  contractAddress: string,
  network?: string,
): Promise<ContractAbi[]> {
  // Select the appropriate API endpoint based on network
  const baseUrl = "https://api.etherscan.io";

  const apiKey = process.env.ETHERSCAN_API_KEY!;
  console.log("network getcontractabi", network);
  try {
    const { data } = await axios.get<EtherscanResponse>(`${baseUrl}/v2/api`, {
      params: {
        module: "contract",
        action: "getabi",
        address: contractAddress,
        apikey: apiKey,
        chainId: network ? EtherScanChains[network] : undefined,
      },
    });

    if (data.status === "0") {
      throw new Error(`Etherscan API error: ${data.message}, ${data.result}`);
    }

    // Etherscan returns the ABI as a string, so we need to parse it
    const abi = JSON.parse(data.result as string) as ContractAbi[];
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

async function getContractCreator(
  contractAddress: string,
  network: string,
): Promise<ContractCreation> {
  const baseUrl = "https://api.etherscan.io";
  const apiKey = process.env.ETHERSCAN_API_KEY!;
  console.log("network getcontractcreator", network);
  try {
    const { data } = await axios.get<EtherscanResponse>(`${baseUrl}/v2/api`, {
      params: {
        module: "contract",
        action: "getcontractcreation",
        contractaddresses: contractAddress,
        apikey: apiKey,
        chainId: network ? EtherScanChains[network] : undefined,
      },
    });

    if (data.status === "0") {
      throw new Error(`Etherscan API error: ${data.message}, ${data.result}`);
    }

    const contractCreation = data.result as ContractCreation[];
    return contractCreation[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Error fetching Contract Creator from Etherscan:", error);
    }
    throw error;
  }
}

async function getViewOnlyContractABI(
  contractAddress: string,
  network?: string,
): Promise<ContractAbi[]> {
  console.log("networ getViewOnlyCon", network);
  const abiUnfiltered = await getContractABI(contractAddress, String(network));
  return filter(
    abiUnfiltered,
    (abiItem) =>
      abiItem.type === "function" && abiItem.stateMutability === "view",
  );
}

export async function loadEthersViewOnlyContract(
  contractAddress: string,
  network?: string,
  provider: Provider = baseProvider,
) {
  try {
    console.log("network loadEthersV", network);
    const abi = await getViewOnlyContractABI(contractAddress, network);
    return new Contract(contractAddress, new Interface(abi), provider);
  } catch (e) {
    return undefined;
  }
}

export async function contractOwnerFromContractAddress(
  contractAddress?: string,
  network?: string
) {
  if (isUndefined(contractAddress))
    return { ownerId: undefined, ownerIdType: "fid" as OwnerType };

  const contract = await loadEthersViewOnlyContract(contractAddress, network);
  if (isUndefined(contract))
    return { ownerId: undefined, ownerIdType: "fid" as OwnerType };
  return contractOwnerFromContract(contract, network);
}

export async function contractOwnerFromContract(contract: Contract, network?: string) {
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
    const deploymentTx = contract.deploymentTransaction();
    if (deploymentTx) {
      ownerId = deploymentTx.from;
    } else {
      console.log("network contractOwnerFromContract", network);
      const contractCreation = await getContractCreator(
        contract.target.toString(),
        String(network),
      );
      ownerId = contractCreation.contractCreator;
      try {
        const userFid = await neynar.fetchBulkUsersByEthereumAddress([ownerId]);
        if (userFid[ownerId]) {
          ownerId = userFid[ownerId][0].fid.toString();
          ownerIdType = "fid" as OwnerType;
        }
      } catch (error) {
        console.error("Error fetching user FID:", error);
      }
      console.log("Contract creator:", contractCreation);
    }
  }

  return {
    ownerId,
    ownerIdType,
  };
}

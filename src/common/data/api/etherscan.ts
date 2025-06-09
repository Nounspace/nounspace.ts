import { EtherScanChains } from "@/constants/etherscanChainIds";
import axios from "axios";
import { 
  createPublicClient, 
  http, 
  getContract, 
  Address,
  PublicClient,
  Abi
} from "viem";
import { base } from "viem/chains";
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

// Server-only environment variable to prevent API key exposure to client
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey && typeof window === 'undefined') {
  throw new Error('ALCHEMY_API_KEY environment variable is required');
}

export const publicClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`)
});

// Rate limiting setup
const RATE_LIMIT = 5; // 5 calls per second
const BUCKET_SIZE = 5;
let tokens = BUCKET_SIZE;
let lastRefill = Date.now();

async function refillTokens() {
  const now = Date.now();
  const timePassed = now - lastRefill;
  const tokensToAdd = Math.floor(timePassed / 1000) * RATE_LIMIT;
  if (tokensToAdd > 0) {
    tokens = Math.min(BUCKET_SIZE, tokens + tokensToAdd);
    lastRefill = now;
  }
}

async function waitForToken() {
  await refillTokens();
  if (tokens <= 0) {
    const waitTime = Math.ceil((1000 - (Date.now() - lastRefill)) / RATE_LIMIT);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    await refillTokens();
  }
  tokens--;
}

async function getContractABI(
  contractAddress: string,
  network?: string,
): Promise<ContractAbi[]> {
  // Select the appropriate API endpoint based on network
  const baseUrl = "https://api.etherscan.io";

  const apiKey = process.env.ETHERSCAN_API_KEY!;
  try {
    await waitForToken();
    const { data } = await axios.get<EtherscanResponse>(`${baseUrl}/v2/api`, {
      params: {
        module: "contract",
        action: "getabi",
        address: contractAddress,
        apikey: apiKey,
        chainid: network ? EtherScanChains[network] : undefined,
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
  network?: string,
): Promise<ContractCreation> {
  const baseUrl = "https://api.etherscan.io";
  const apiKey = process.env.ETHERSCAN_API_KEY!;
  try {
    await waitForToken();
    const { data } = await axios.get<EtherscanResponse>(`${baseUrl}/v2/api`, {
      params: {
        module: "contract",
        action: "getcontractcreation",
        contractaddresses: contractAddress,
        apikey: apiKey,
        chainid: network ? EtherScanChains[network] : undefined,
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
): Promise<Abi> {
  const abiUnfiltered = await getContractABI(contractAddress, network);
  return filter(
    abiUnfiltered,
    (abiItem) =>
      abiItem.type === "function" && abiItem.stateMutability === "view",
  ) as Abi;
}

function hasFunction(abi: Abi, functionName: string): boolean {
  return abi.some(item => 
    item.type === 'function' && 
    item.name === functionName
  );
}

export async function loadViemViewOnlyContract(
  contractAddress: string,
  network?: string,
  client: PublicClient = publicClient as PublicClient,
) {
  try {
    const abi = await getViewOnlyContractABI(contractAddress, network);
    return {
      contract: getContract({
        address: contractAddress as Address,
        abi,
        client,
      }),
      abi
    };
  } catch (e) {
    return undefined;
  }
}

export async function contractOwnerFromContractAddress(
  contractAddress?: string,
  network?: string,
) {
  if (isUndefined(contractAddress))
    return { ownerId: undefined, ownerIdType: "fid" as OwnerType };
  const contractData = await loadViemViewOnlyContract(contractAddress, network);
  if (isUndefined(contractData))
    return { ownerId: undefined, ownerIdType: "fid" as OwnerType };
  return contractOwnerFromContract(contractData.contract, contractData.abi, contractAddress, network);
}

export async function contractOwnerFromContract(
  contract: any,
  abi: Abi,
  contractAddress: string,
  network?: string,
) {
  let ownerId: string | undefined = "";
  let ownerIdType: OwnerType = "address";
  
  try {
    if (hasFunction(abi, "fid")) {
      const result = await contract.read.fid();
      ownerId = result.toString();
      ownerIdType = "fid" as OwnerType;
    } else if (hasFunction(abi, "owner")) {
      ownerId = await contract.read.owner() as string;
    } else if (hasFunction(abi, "deployer")) {
      ownerId = await contract.read.deployer() as string;
    } else {
      // Use contract creator address as a fall back
      const contractCreation = await getContractCreator(
        contractAddress,
        network,
      );
      ownerId = contractCreation.contractCreator;
      try {
        const addresses = [ownerId];
        const userFid = await neynar.fetchBulkUsersByEthOrSolAddress({addresses});
        if (userFid[ownerId]) {
          ownerId = userFid[ownerId][0].fid.toString();
          ownerIdType = "fid" as OwnerType;
        }
      } catch (error) {
        console.error("Error fetching user FID:", error);
      }
      // console.log("Contract creator:", contractCreation);
    }
  } catch (error) {
    console.error("Error reading contract:", error);
  }

  return {
    ownerId,
    ownerIdType,
  };
}

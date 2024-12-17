import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

const CHAIN_OPTIONS = [
  {
    id: "1", // Ethereum Mainnet Chain ID
    name: "Ethereum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg",
  },
  {
    id: "56", // Binance Smart Chain Mainnet Chain ID
    name: "Binance Smart Chain",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg",
  },
  {
    id: "42161", // Arbitrum One Chain ID
    name: "Arbitrum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ARBITRUM/icon.svg",
  },
  {
    id: "137", // Polygon Mainnet Chain ID
    name: "Polygon",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/POLYGON/icon.svg",
  },
  {
    id: "43114", // Avalanche C-Chain Chain ID
    name: "Avalanche",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/AVAX_CCHAIN/icon.svg",
  },
  {
    id: "10", // Optimism Mainnet Chain ID
    name: "Optimism",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/OPTIMISM/icon.svg",
  },
  {
    id: "81457", // Blast Mainnet Chain ID
    name: "Blast",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BLAST/icon.svg",
  },
  {
    id: "59144", // Linea Mainnet Chain ID
    name: "Linea",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/LINEA/icon.svg",
  },
  {
    id: "8453", // Base Mainnet Chain ID
    name: "Base",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BASE/icon.svg",
  },
];

export interface ChainSelectorProps {
  onChange: (chainName: string) => void;
  value: string | null;
  className?: string;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  // Find the selected chain name or fallback to "Select a chain"
  const selectedChain = CHAIN_OPTIONS.find((chain) => chain.id === value);
  const selectedChainName = selectedChain?.name || "Select a chain";
  const selectedChainLogo = selectedChain?.logo;

  return (
    <Select
      onValueChange={(selectedId) => {
        const selectedChain = CHAIN_OPTIONS.find(
          (chain) => chain.id === selectedId,
        );
        if (selectedChain) {
          onChange(selectedChain.id); // Pass the string ID (e.g., "ETH") to onChange
        }
      }}
    >
      <SelectTrigger
        className={className}
        aria-label="Select blockchain network"
      >
        <div className="flex items-center">
          {selectedChainLogo && (
            <img
              src={selectedChainLogo}
              alt={selectedChainName}
              className="h-6 w-6 mr-2"
            />
          )}
          <SelectValue
            placeholder="Select a chain"
            className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
          >
            {selectedChainName}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {CHAIN_OPTIONS.map((chain) => (
          <SelectItem
            value={chain.id}
            key={chain.id}
            className="flex items-center"
          >
            <div className="flex items-center">
              <img src={chain.logo} alt={chain.name} className="h-6 w-6 mr-2" />
              <span>{chain.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;

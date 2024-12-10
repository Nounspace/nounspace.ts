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
    id: "ETH",
    name: "Ethereum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg",
  },
  {
    id: "BSC",
    name: "Binance Smart Chain",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg",
  },
  {
    id: "ARBITRUM",
    name: "Arbitrum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ARBITRUM/icon.svg",
  },
  {
    id: "POLYGON",
    name: "Polygon",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/POLYGON/icon.svg",
  },
  {
    id: "AVAX",
    name: "Avalanche",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/AVAX_CCHAIN/icon.svg",
  },
  {
    id: "OPTIMISM",
    name: "Optimism",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/OPTIMISM/icon.svg",
  },
  // Blast
  {
    id: "BLAST",
    name: "Blast",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BLAST/icon.svg",
  },
  {
    id: "LINEA",
    name: "Linea",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/LINEA/icon.svg",
  },
  // {
  //   id: "BTC",
  //   name: "Bitcoin",
  //   logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BTC/icon.svg",
  // },
  // {
  //   id: "LTC",
  //   name: "Litecoin",
  //   logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/LTC/icon.svg",
  // },
  // {
  //   id: "DOGE",
  //   name: "Dogecoin",
  //   logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/DOGE/icon.svg",
  // },
  // add BASE
  {
    id: "BASE",
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

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/common/components/atoms/select";

const CHAIN_OPTIONS = [
  {
    id: "1",
    name: "ethereum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg",
  },
  {
    id: "56",
    name: "binance smart chain",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg",
  },
  {
    id: "42161",
    name: "arbitrum",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ARBITRUM/icon.svg",
  },
  {
    id: "137",
    name: "polygon",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/POLYGON/icon.svg",
  },
  {
    id: "43114",
    name: "avalanche",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/AVAX_CCHAIN/icon.svg",
  },
  {
    id: "10",
    name: "optimism",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/OPTIMISM/icon.svg",
  },
  {
    id: "81457",
    name: "blast",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BLAST/icon.svg",
  },
  {
    id: "59144",
    name: "linea",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/LINEA/icon.svg",
  },
  {
    id: "8453",
    name: "base",
    logo: "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BASE/icon.svg",
  },
];

export interface ChainSelectorProps {
  onChange: (chain: { id: string; name: string }) => void;
  value: { id: string; name: string } | null; // Expect full object as value
  className?: string;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const selectedChain = CHAIN_OPTIONS.find((chain) => chain.id === value?.id);

  return (
    <Select
      value={selectedChain?.id || ""}
      onValueChange={(selectedId) => {
        const selectedChain = CHAIN_OPTIONS.find(
          (chain) => chain.id === selectedId,
        );
        if (selectedChain) {
          onChange({ id: selectedChain.id, name: selectedChain.name });
        }
      }}
    >
      <SelectTrigger
        className={className}
        aria-label="Select blockchain network"
      >
        <div className="flex items-center">
          {selectedChain ? (
            <>
              <img
                src={selectedChain.logo}
                alt={selectedChain.name}
                className="h-6 w-6 mr-2"
              />
              <span>{selectedChain.name}</span>
            </>
          ) : (
            <span>Select a chain</span>
          )}
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

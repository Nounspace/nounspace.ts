import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

const CHAIN_OPTIONS = [
  { id: 1, name: "Ethereum Mainnet" },
  { id: 137, name: "Polygon" },
  { id: 8453, name: "Base" },
  { id: 56, name: "Binance Smart Chain" },
  { id: 10, name: "Optimism" },
  { id: 42161, name: "Arbitrum One" },
  { id: 43114, name: "Avalanche" },
  { id: 250, name: "Fantom" },
  { id: 100, name: "Gnosis Chain" },
  { id: 5, name: "Goerli Testnet" },
];

export interface ChainSelectorProps {
  onChange: (chainId: number) => void;
  value: number | null;
  className?: string;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  // Find the selected chain name or fallback to "Select a chain"
  const selectedChainName =
    CHAIN_OPTIONS.find((chain) => chain.id === value)?.name || "Select a chain";

  return (
    <Select
      onValueChange={(selectedId) => {
        const selectedChain = CHAIN_OPTIONS.find(
          (chain) => chain.id === Number(selectedId),
        );
        if (selectedChain) {
          onChange(selectedChain.id);
        }
      }}
    >
      <SelectTrigger
        className={className}
        aria-label="Select blockchain network"
      >
        <SelectValue
          placeholder="Select a chain"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          {selectedChainName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CHAIN_OPTIONS.map((chain) => (
          <SelectItem value={chain.id.toString()} key={chain.id}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;

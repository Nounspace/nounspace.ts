import React from "react";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

export const CHAIN_OPTIONS: {
  id: AlchemyNetwork;
  name: string;
  scanUrl: string;
}[] = [
  { id: "eth", name: "Ethereum", scanUrl: "https://etherscan.io" },
  { id: "polygon", name: "Polygon", scanUrl: "https://polygonscan.com" },
  { id: "opt", name: "Optimism", scanUrl: "https://optimistic.etherscan.io" },
  { id: "arb", name: "Arbitrum", scanUrl: "https://arbiscan.io" },
  { id: "base", name: "Base", scanUrl: "https://basescan.org" },
  { id: "starknet", name: "StarkNet", scanUrl: "https://voyager.online" },
  // { id: "astar", name: "Astar", scanUrl: "https://astar.subscan.io" },
  // { id: "frax", name: "Frax", scanUrl: "https://fraxscan.com" },
  // { id: "zora", name: "Zora", scanUrl: "https://zorascan.io" },
];

export interface AlchemyChainSelectorProps {
  onChange: (chainName: AlchemyNetwork) => void;
  value: AlchemyNetwork;
  className?: string;
}

export const AlchemyChainSelector: React.FC<AlchemyChainSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const settings = CHAIN_OPTIONS;

  return (
    <Select
      onValueChange={(selectedId) => {
        const selectedChain = settings.find((chain) => chain.id === selectedId);
        if (selectedChain) {
          onChange(selectedChain.id);
        }
      }}
      value={value}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a chain"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          {settings.find((chain) => chain.id === value)?.name ||
            "Select a chain"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((chain, i) => (
          <SelectItem value={chain.id} key={i}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AlchemyChainSelector;

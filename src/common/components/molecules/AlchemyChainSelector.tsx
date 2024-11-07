import React from "react";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

export const CHAIN_OPTIONS: { id: AlchemyNetwork; name: string }[] = [
  { id: "eth", name: "Ethereum" },
  { id: "polygon", name: "Polygon" },
  { id: "opt", name: "Optimism" },
  { id: "arb", name: "Arbitrum" },
  { id: "base", name: "Base" },
  { id: "starknet", name: "StarkNet" },
  // { id: "astar", name: "Astar" },
  // { id: "frax", name: "Frax" },
  // { id: "zora", name: "Zora" },
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

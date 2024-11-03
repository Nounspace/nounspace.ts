import React from "react";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

// export const CHAIN_OPTIONS = [
//   { name: "eth" },
//   { name: "polygon" },
//   { name: "opt" },
//   { name: "arb" },
//   { name: "base" },
//   { name: "starknet" },
//   { name: "astar" },
//   { name: "frax" },
//   { name: "zora" },
// ];
export const CHAIN_OPTIONS: AlchemyNetwork[] = [
  "eth",
  "polygon",
  "opt",
  "arb",
  "base",
  "starknet",
  // "astar",
  // "frax",
  // "zora",
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

  console.log({ value });

  return (
    <Select
      onValueChange={(selectedName) => {
        const selectedChain = settings.find((chain) => chain === selectedName);
        if (selectedChain) {
          onChange(selectedChain);
        }
      }}
      value={value}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a chain"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          {value || "Select a chain"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((chain, i) => (
          <SelectItem value={chain} key={i}>
            {chain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AlchemyChainSelector;

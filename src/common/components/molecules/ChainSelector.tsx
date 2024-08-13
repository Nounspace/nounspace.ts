import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import { CHAIN_OPTIONS } from "@/fidgets/swap/utils/chains";

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
  const settings = CHAIN_OPTIONS;

  return (
    <Select
      onValueChange={(selectedId) => {
        const selectedChain = settings.find(
          (chain) => chain.id === Number(selectedId),
        );
        if (selectedChain) {
          onChange(selectedChain.id);
        }
      }}
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
          <SelectItem value={chain.id.toString()} key={i}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/common/components/atoms/select";

const DATA_SOURCE_OPTIONS = [
  { id: "dexscreener", name: "DexScreener" },
  { id: "geckoterminal", name: "GeckoTerminal" },
];

export interface MarketDataSelectorProps {
  onChange: (source: string) => void;
  value: string;
  className?: string;
}

export const MarketDataSelector: React.FC<MarketDataSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label="Select data source">
        <div className="flex items-center">
          <span>
            {DATA_SOURCE_OPTIONS.find((option) => option.id === value)?.name ||
              "Select a data source"}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {DATA_SOURCE_OPTIONS.map((source) => (
          <SelectItem
            value={source.id}
            key={source.id}
            className="flex items-center"
          >
            <div className="flex items-center">
              <span>{source.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MarketDataSelector;

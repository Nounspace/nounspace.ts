import React, { useState } from "react";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import TextInput from "./TextInput";
import { CHAIN_OPTIONS } from "./AlchemyChainSelector";

export interface AlchemyNftSelectorProps {
  onChange: (imageUrl: string) => void;
  value: string;
  className?: string;
}

export const AlchemyNftSelector: React.FC<AlchemyNftSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>("");
  const settings = CHAIN_OPTIONS;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm">Enter Wallet Address</span>
        <TextInput
          value={textInputValue}
          onChange={(value) => setTextInputValue(value)}
          className="!border-input !h-8 !rounded-xl text-sm"
        />
      </div>
      <div>
        <span className="text-sm">Select Network</span>
        <Select
          onValueChange={(selectedName) => {
            const selectedChain = settings.find(
              (chain) => chain === selectedName,
            );
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
      </div>
      <div>
        <span className="text-sm">Select NFT</span>
        <div className="grid grid-cols-3 gap-2 p-3 border border-gray-300 cursor-pointer rounded-lg max-h-[200px] overflow-y-scroll">
          {Array.from({ length: 18 }).map((_, index) => (
            <div
              key={index}
              className={`origin-center w-full aspect-square rounded-sm flex items-center justify-center overflow-hidden ${selectedImage === index ? "scale-105 border-2 border-blue-500" : "hover:scale-105 hover:border-2 hover:border-blue-300"}`}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={`https://via.placeholder.com/150?text=Image+${index + 1}`}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlchemyNftSelector;

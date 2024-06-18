import React from "react";
import type { FontConfig } from "@/common/lib/theme/fonts";
import type { FontFamily } from "@/common/lib/theme";
import { FONT_FAMILY_OPTIONS } from "@/common/lib/theme/fonts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

const FONT_FAMILY_OPTIONS_BY_NAME = FONT_FAMILY_OPTIONS.reduce(
  (acc, v) => ({ ...acc, [v.name]: v }),
  {},
);

export interface FontSelectorProps {
  onChange: (fontConfig: FontFamily) => void;
  value: string;
  className?: string;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const selectedFont: FontConfig = FONT_FAMILY_OPTIONS_BY_NAME[value];

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a font"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          <span style={selectedFont?.config?.style}>{value}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FONT_FAMILY_OPTIONS.map((font, i) => {
          return (
            <SelectItem style={font.config.style} value={font.name} key={i}>
              {font.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default FontSelector;

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
} from "@/common/ui/atoms/select"

const FONT_FAMILY_OPTIONS_BY_NAME = FONT_FAMILY_OPTIONS.reduce((a, v) => ({...a, [v.name]: v}), {}) 

export interface FontSelectorProps {
  onChange: (fontConfig: FontConfig) => void;
  value: string;
}

export function FontSelector({
  onChange,
  value
}) {
  const fontConfig = FONT_FAMILY_OPTIONS_BY_NAME[value]?.config

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder="Select a font"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          <span className={`${fontConfig?.className}`}>{ value }</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {
          FONT_FAMILY_OPTIONS.map(
            (font, i) => {
              return (
                <SelectItem
                  value={font.name}
                  key={i}
                >
                  {font.name}
                </SelectItem>
              )
            }
          )
        }
      </SelectContent>
    </Select>
  )
}

export default FontSelector;

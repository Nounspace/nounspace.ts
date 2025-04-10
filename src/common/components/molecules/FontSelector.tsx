import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import type { FontFamily } from "@/common/lib/theme";
import { FONT_FAMILY_OPTIONS } from "@/common/lib/theme/fonts";
import React from "react";

export const FONT_FAMILY_OPTIONS_BY_NAME = FONT_FAMILY_OPTIONS.reduce(
  (acc, v) => ({ ...acc, [v.name]: v }),
  {},
);

const getSettingByValue = (settings, value: string) => {
  if (!value) return null;
  const byName = settings.find((setting) => setting.name === value);
  if (byName) return byName;
  
  return settings.find((setting) => setting.config.style.fontFamily === value);
};

export interface FontSelectorProps {
  onChange: (fontConfig: FontFamily) => void;
  value: string;
  className?: string;
  hideGlobalSettings?: boolean;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  onChange,
  value,
  className,
  hideGlobalSettings = false,
}) => {
  const settings = FONT_FAMILY_OPTIONS.filter((setting) => {
    if (hideGlobalSettings) {
      return !setting.global;
    }
    return true;
  });
  const selectedFont = getSettingByValue(settings, value);

  const handleValueChange = (fontFamily: string) => {
    const fontConfig = settings.find(
      (setting) => setting.config.style.fontFamily === fontFamily
    );
    if (fontConfig) {
      onChange(fontConfig.name);
    }
  };

  return (
    <Select onValueChange={handleValueChange} value={selectedFont?.config?.style?.fontFamily || ""}>
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a font"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          <span style={selectedFont?.config?.style}>
            {selectedFont ? selectedFont.name : "Select a font"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((font, i) => {
          return (
            <SelectItem
              style={font.config.style}
              value={font.config.style.fontFamily}
              key={i}
            >
              {font.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default FontSelector;

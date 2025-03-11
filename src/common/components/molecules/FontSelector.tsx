import React, { useEffect, useState } from "react";
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

export const FONT_FAMILY_OPTIONS_BY_NAME = FONT_FAMILY_OPTIONS.reduce(
  (acc, v) => ({ ...acc, [v.name]: v }),
  {},
);

// Find font setting by name or fontFamily value
const findFontSetting = (settings, value: string) => {
  if (!value) return null;

  // Direct match by font name
  const directMatch = settings.find((setting) => setting.name === value);
  if (directMatch) return directMatch;

  // Match by fontFamily CSS variable
  const cssVarMatch = settings.find((setting) =>
    setting.config.style.fontFamily === value
  );
  if (cssVarMatch) return cssVarMatch;

  // Match by Next.js font identifier
  if (value.includes('_')) {
    const fontNamePart = value.split('_')[1]?.toLowerCase();
    if (fontNamePart) {
      return settings.find((setting) =>
        setting.name.toLowerCase().includes(fontNamePart)
      );
    }
  }

  return null;
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
  // Store local selection state
  const [selectedValue, setSelectedValue] = useState<string>("");

  const settings = FONT_FAMILY_OPTIONS.filter((setting) => {
    if (hideGlobalSettings) {
      return !setting.global;
    }
    return true;
  });

  // Update local state when external value changes
  useEffect(() => {
    if (value) {
      // Find the font setting by name or by font family value
      const fontSetting = findFontSetting(settings, value);
      if (fontSetting) {
        setSelectedValue(fontSetting.name);
      } else {
        // If we can't find it, just use the raw value
        setSelectedValue(value);
      }
    }
  }, [value, settings]);

  // Get font setting from selected value
  const fontSetting = selectedValue ?
    FONT_FAMILY_OPTIONS_BY_NAME[selectedValue] || findFontSetting(settings, selectedValue) :
    null;



  return (
    <Select
      value={selectedValue}
      onValueChange={(newValue) => {
        // console.log("Font selected:", newValue);
        setSelectedValue(newValue);
        onChange(newValue as FontFamily);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a font"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          {fontSetting ? (
            <span style={fontSetting.config?.style}>
              {fontSetting.name}
            </span>
          ) : (
            <span>Select a font</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((font, i) => (
          <SelectItem
            style={font.config.style}
            value={font.name}
            key={i}
          >
            {font.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FontSelector;

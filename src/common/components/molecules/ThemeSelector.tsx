import React from "react";
import type { WidgetTheme } from "@lifi/widget";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import {
  azureLightTheme,
  watermelonLightTheme,
  windows95Theme,
} from "@lifi/widget";

const THEME_OPTIONS = [
  { name: "Azure Light", config: azureLightTheme },
  { name: "Watermelon Light", config: watermelonLightTheme },
  { name: "Windows 95", config: windows95Theme },
  { name: "Custom", config: {} },
];

const THEME_OPTIONS_BY_NAME = THEME_OPTIONS.reduce(
  (acc, v) => ({ ...acc, [v.name]: v }),
  {},
);

const getSettingByValue = (
  settings: { name: string }[],
  value: string,
): { name: string } | undefined => {
  return settings.find((setting) => setting.name === value);
};

export interface ThemeSelectorProps {
  onChange: (themeConfig: WidgetTheme | string) => void;
  value: string;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const settings = THEME_OPTIONS;

  return (
    <Select
      onValueChange={(selectedName) => {
        const selectedTheme = THEME_OPTIONS_BY_NAME[selectedName];
        if (selectedTheme) {
          onChange(selectedName === "Custom" ? "Custom" : selectedTheme.config);
        }
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select a theme"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          {value === "Custom"
            ? "Custom"
            : getSettingByValue(settings, value)?.name || "Select a theme"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((theme, i) => (
          <SelectItem value={theme.name} key={i}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ThemeSelector;

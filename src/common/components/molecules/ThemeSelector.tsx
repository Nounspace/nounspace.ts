import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";

const THEME_OPTIONS = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
];

const ThemeSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={THEME_OPTIONS}
      className={className}
    />
  );
};

export default ThemeSelector;

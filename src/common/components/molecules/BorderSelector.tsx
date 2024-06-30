import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import { BORDER_STYLES } from "@/common/lib/theme/helpers";

export const BorderSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={BORDER_STYLES}
      className={className}
    />
  );
};

export default BorderSelector;

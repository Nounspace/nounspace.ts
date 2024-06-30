import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import { SHADOW_STYLES } from "@/common/lib/theme/helpers";

export const ShadowSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
}> = ({ onChange, value, className }) => {
  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={SHADOW_STYLES}
      className={className}
    />
  );
};

export default ShadowSelector;

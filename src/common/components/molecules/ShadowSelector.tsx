import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import { SHADOW_STYLES } from "@/common/lib/theme/helpers";

export const ShadowSelector: React.FC<{
  onChange: (value: string) => void;
  value: string;
  className?: string;
  hideGlobalSettings?: boolean;
}> = ({ onChange, value, className, hideGlobalSettings = false }) => {
  const settings = SHADOW_STYLES.filter((setting) => {
    if (hideGlobalSettings) {
      return !setting.global;
    }
    return true;
  });

  return (
    <SettingsSelector
      onChange={onChange}
      value={value}
      settings={settings}
      className={className}
    />
  );
};

export default ShadowSelector;

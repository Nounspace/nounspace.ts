import React from "react";
import SwitchButton from "@/common/components/molecules/SwitchButton";
import { WithMargin } from "@/fidgets/helpers";

export type CropToggleButtonProps = {
  isCropMode: boolean;
  onToggle: (value: boolean) => void;
};

const CropToggleButton: React.FC<CropToggleButtonProps> = ({
  isCropMode,
  onToggle,
}) => {
  return (
    <WithMargin>
      <SwitchButton
        value={isCropMode}
        onChange={onToggle}
        label="Crop Mode"
      />
    </WithMargin>
  );
};

export default CropToggleButton; 

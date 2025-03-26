import React from "react";
import { Switch } from "@/common/components/atoms/switch";
import { Label } from "@/common/components/atoms/label";

export type ViewMode = "list" | "grid";

export interface SwitchButtonProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({ value, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value}
        onCheckedChange={onChange}
        id="toggle-switch"
      />
      {label && <Label htmlFor="toggle-switch">{label}</Label>}
    </div>
  );
};

export default SwitchButton;

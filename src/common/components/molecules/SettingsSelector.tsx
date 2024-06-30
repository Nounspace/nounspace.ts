import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";

type Setting = {
  name: string;
  value: string;
};

interface SettingsSelectorProps {
  onChange: (value: string) => void;
  value: string;
  settings: Setting[];
  className?: string;
}

const getSettingByValue = (settings: Setting[], value: string) => {
  return settings.find((setting) => setting.value === value);
};

export const SettingsSelector: React.FC<SettingsSelectorProps> = ({
  onChange,
  value,
  settings,
  className,
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className={className}>
        <SelectValue
          placeholder="Select"
          className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
        >
          <span>{getSettingByValue(settings, value)?.name}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((setting, i) => {
          return (
            <SelectItem value={setting.value} key={i}>
              {setting.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SettingsSelector;

import React from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/common/components/atoms/select";

export interface CSVSelectorOption {
  name: string;
}

export interface CSVSelectorProps {
  onChange: (selectedApp: CSVSelectorOption) => void;
  value: CSVSelectorOption | null;
  className?: string;
}

export const CSVSelector: React.FC<CSVSelectorProps> = ({
  onChange,
  value = { name: "Text" },
  className,
}) => {
  const settings: CSVSelectorOption[] = [
    {
      name: "Text",
    },
    {
      name: "External URL",
    },
  ];

  return (
    <div className={className}>
      <Select
        value={value?.name}
        onValueChange={(selectedName) => {
          const selectedApp = settings.find((app) => app.name === selectedName);
          if (selectedApp) {
            onChange(selectedApp);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center">
              {value?.name || "Select Platform"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {settings.map((app: CSVSelectorOption) => (
            <SelectItem key={app.name} value={app.name}>
              <div className="flex items-center">
                <span>{app.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

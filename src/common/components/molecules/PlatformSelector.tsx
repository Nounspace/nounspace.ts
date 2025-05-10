import React from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/common/components/atoms/select";

export interface Platform {
  name?: string;
  icon?: string;
}

export interface PlatformSelectorProps {
  onChange: (selectedApp: Platform) => void;
  value: Platform | null;
  className?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  onChange,
  value = { name: "Farcaster", icon: "/images/farcaster.jpeg" },
  className,
}) => {
  const settings: Platform[] = [
    {
      name: "Farcaster",
      icon: "/images/farcaster.jpeg",
    },
    {
      name: "X",
      icon: "/images/twitter.avif",
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
              <img
                src={value?.icon || "/images/farcaster.jpeg"}
                alt={`${value?.name || "Platform"} icon`}
                className="mr-2 h-auto w-5 rounded-sm"
              />
              {value?.name || "Select Platform"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {settings.map((app: Platform) => (
            <SelectItem key={app.name} value={app.name || ""}>
              <div className="flex items-center">
                {app.icon && (
                  <img
                    src={app.icon || "/images/tom-alerts.png"}
                    alt={`${app.name} icon`}
                    className="mr-2 h-auto w-5 rounded-sm"
                  />
                )}
                {app.name && <span>{app.name}</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlatformSelector;

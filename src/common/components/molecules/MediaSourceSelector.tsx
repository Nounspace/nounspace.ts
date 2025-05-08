import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import React from "react";

export enum MediaSourceTypes {
  URL = "URL",
  EXTERNAL = "External NFT Collection",
  WALLET = "My Wallet",
  UPLOAD = "Upload image",
}

export interface MediaSource {
  name?: MediaSourceTypes;
}

export interface MediaSourceSelectorProps {
  onChange: (selectedApp: MediaSource) => void;
  value: MediaSource | null;
  className?: string;
}

const settings: MediaSource[] = [
  { name: MediaSourceTypes.URL },
  { name: MediaSourceTypes.UPLOAD },
  { name: MediaSourceTypes.EXTERNAL },
  { name: MediaSourceTypes.WALLET},
];

const MediaSourceSelector: React.FC<MediaSourceSelectorProps> = ({
  onChange,
  value = settings[0],
  className,
}) => {
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
              {value?.name || "Select media source"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {settings.map((app: MediaSource) => (
            <SelectItem key={app.name} value={app.name || ""}>
              <div className="flex items-center">
                {app.name && <span>{app.name}</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MediaSourceSelector;

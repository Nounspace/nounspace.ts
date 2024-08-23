import React from "react";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/common/components/atoms/select";

import { DAO_OPTIONS } from "@/constants/basedDaos";

interface Dao {
  name: string;
  contract: string;
  graphUrl: string;
}

export interface DaoSelectorProps {
  onChange: (selectedDao: Dao) => void;
  value: Dao | null;
  className?: string;
}

export const DaoSelector: React.FC<DaoSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const settings = DAO_OPTIONS;

  return (
    <Select
      className={className}
      value={value?.name}
      onValueChange={(selectedName) => {
        const selectedDao = settings.find((dao) => dao.name === selectedName);
        if (selectedDao) {
          onChange(selectedDao);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue>{value?.name || "Select a DAO"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {settings.map((dao: Dao) => (
          <SelectItem key={dao.name} value={dao.name}>
            {dao.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

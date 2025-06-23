import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/atoms/tooltip";
import { FaInfoCircle } from "react-icons/fa";

interface ThemeSettingsTooltipProps {
  text: string;
}

export const ThemeSettingsTooltip: React.FC<ThemeSettingsTooltipProps> = ({ text }) => {
  return (
    <div className="flex grow flex-row-reverse">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 pl-1">
              <FaInfoCircle color="#D1D5DB" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-44">{text}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ThemeSettingsTooltip;

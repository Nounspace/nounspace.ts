import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface TooltipPopoverProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function TooltipPopover({ trigger, children }: TooltipPopoverProps) {
  return (
    <>
      <Tooltip delayDuration={500}>
        <TooltipTrigger className="hidden w-fit md:flex">{trigger}</TooltipTrigger>
        <TooltipContent className="hidden w-fit md:flex">{children}</TooltipContent>
      </Tooltip>
      <Popover>
        <PopoverTrigger className="w-fit md:hidden">{trigger}</PopoverTrigger>
        <PopoverContent className="w-fit md:hidden">{children}</PopoverContent>
      </Popover>
    </>
  );
}

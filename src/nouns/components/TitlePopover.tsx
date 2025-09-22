import { ReactNode } from "react";
import { TooltipPopover } from "./ui/tooltipPopover";

interface TitlePopoverProps {
  title: string;
  children: ReactNode;
}

export default function TitlePopover({ title, children }: TitlePopoverProps) {
  return (
    <TooltipPopover
      trigger={
        <div className="paragraph-sm -content-border-border-primary my-[6px] w-fit border-b border-dashed pb-1 hover:brightness-90">
          {title}
        </div>
      }
    >
      <div className="text-center">{children}</div>
    </TooltipPopover>
  );
}

import React, { useState, useCallback } from "react";
import { FaCode } from "react-icons/fa6";
import HTMLInput from "@/common/components/molecules/HTMLInput";
import { Button } from "@/common/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/common/components/atoms/popover";

export interface HTMLInputPopoverButtonProps {
  value: string;
  onChange?: (value: string) => void;
}

const HTMLInputPopoverButton: React.FC<HTMLInputPopoverButtonProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={toggleOpen} modal={false}>
      <PopoverAnchor>
        <Button onClick={toggleOpen} variant="outline">
          <FaCode />
        </Button>
      </PopoverAnchor>
      <PopoverContent align="center" side="bottom" className="">
        <HTMLInput value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};

export default HTMLInputPopoverButton;

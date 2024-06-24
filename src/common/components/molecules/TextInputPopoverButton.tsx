import React, { useState, useCallback } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { Button } from "@/common/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/common/components/atoms/popover";

export interface TextInputPopoverButtonProps {
  value: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}

const TextInputPopoverButton: React.FC<TextInputPopoverButtonProps> = ({
  value,
  onChange,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={toggleOpen} modal={false}>
      <PopoverAnchor>
        <Button onClick={toggleOpen} variant="outline">
          {children}
        </Button>
      </PopoverAnchor>
      <PopoverContent align="center" side="bottom" className="">
        <TextInput value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};

export default TextInputPopoverButton;

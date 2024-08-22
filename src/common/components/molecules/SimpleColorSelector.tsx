import React, { useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/atoms/popover";
import { Button } from "@/common/components/atoms/button";
import { Color } from "@/common/lib/theme";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import { HexColorPicker } from "react-colorful";
export type SimpleColorSelectorProps = {
  value: Color;
  onChange: (value: Color) => void;
  className?: string;
  innerClassName?: string;
};

export const SimpleColorSelector: React.FC<SimpleColorSelectorProps> = ({
  value,
  onChange,
  className,
  innerClassName,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const _onChange = useCallback<(val: string) => void>(
    (val) => {
      onChange(val as Color);
    },
    [onChange],
  );

  return (
    <Popover open={isEditing} onOpenChange={setIsEditing}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={mergeClasses(
            "p-0.5 h-9 w-9 flex flex-shrink-0 items-stretch border cursor-pointer rounded-md disabled:opacity-50 disabled:pointer-events-none",
            className,
          )}
        >
          <div
            className={mergeClasses("flex-1 rounded-[6px]", innerClassName)}
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <HexColorPicker color={value} onChange={_onChange} />
      </PopoverContent>
    </Popover>
  );
};

export default SimpleColorSelector;

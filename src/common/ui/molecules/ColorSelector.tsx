import React, { useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/ui/atoms/popover";
import { Button } from "@/common/ui/atoms/button"
import { Color } from "@/common/lib/theme"
import { HexAlphaColorPicker } from "react-colorful";

export type ColorSelectorProps = {
  value: Color,
  onChange: (value: Color) => void,
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange
}: ColorSelectorProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const _onChange = useCallback<(val: string) => void>(
    (val) => {
      onChange(val as Color)
    },
    [onChange]
  );

  return (
    <Popover
      open={isEditing}
      onOpenChange={setIsEditing}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="p-2 h-9 w-9 flex flex-shrink-0 items-stretch border cursor-pointer rounded-md disabled:opacity-50 disabled:pointer-events-none"
        >
          <div
            className="flex-1 rounded-sm"
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-none bg-transparent"
        align="start"
      >
        <HexAlphaColorPicker
          color={value}
          onChange={_onChange}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ColorSelector;

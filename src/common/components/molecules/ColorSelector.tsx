import { Button } from "@/common/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/atoms/popover";
import { Color } from "@/common/lib/theme";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import React, { useCallback, useMemo, useState } from "react";
import ColorPicker from "react-best-gradient-color-picker";

export type ColorSelectorProps = {
  value: Color;
  onChange: (value: Color) => void;
  className?: string;
  innerClassName?: string;
};

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  className,
  innerClassName,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const resolvedValue = useMemo(() => {
    if (typeof window !== "undefined" && value?.startsWith?.("var(--")) {
      const varName = value.match(/var\((--[^)]+)\)/)?.[1];
      if (varName) {
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        if (computed) return computed;
      }
    }
    return value;
  }, [value]);

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
            style={{ background: resolvedValue }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <ColorPicker
          value={resolvedValue}
          onChange={_onChange}
          width={250}
          height={150}
          hideColorGuide
        />
      </PopoverContent>
    </Popover>
  );
};

export default ColorSelector;

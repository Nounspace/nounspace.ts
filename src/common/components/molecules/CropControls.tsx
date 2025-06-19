import React from "react";
import { Slider } from "@mui/material";
import { WithMargin } from "@/fidgets/helpers";

export type CropControlsProps = {
  offsetX?: number;
  onOffsetXChange?: (value: number) => void;
  offsetY?: number;
  onOffsetYChange?: (value: number) => void;
  isScrollable?: boolean;
  onScrollableChange?: (value: boolean) => void;
};

const CropControls: React.FC<CropControlsProps> = ({
  offsetX,
  onOffsetXChange,
  offsetY,
  onOffsetYChange,
  isScrollable,
  onScrollableChange,
}) => {
  // Determine which control to show based on which props are provided
  if (offsetX !== undefined && onOffsetXChange) {
    return (
      <WithMargin>
        <div>
          <Slider
            value={offsetX}
            onChange={(_, value) => onOffsetXChange(value as number)}
            min={-50}
            max={50}
            step={1}
            valueLabelDisplay="auto"
          />
        </div>
      </WithMargin>
    );
  }

  if (offsetY !== undefined && onOffsetYChange) {
    return (
      <WithMargin>
        <div>
          <Slider
            value={offsetY}
            onChange={(_, value) => onOffsetYChange(value as number)}
            min={-50}
            max={50}
            step={1}
            valueLabelDisplay="auto"
          />
        </div>
      </WithMargin>
    );
  }

  if (isScrollable !== undefined && onScrollableChange) {
    return (
      <WithMargin>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allow Scrolling
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isScrollable}
              onChange={(e) => onScrollableChange(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              {isScrollable ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </WithMargin>
    );
  }

  return null;
};

export default CropControls; 
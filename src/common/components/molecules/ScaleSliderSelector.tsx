import React from "react";
import { Slider } from "@mui/material";
import { Z_INDEX } from "@/common/constants/zIndex";

export type WidthSliderProps = {
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
};

const WidthSlider: React.FC<WidthSliderProps> = ({
  min = 0.1,
  max = 2.1,
  step = 0.1,
  defaultValue = 1,
  onChange,
}) => {
  return (
    <div className="ml-3 mr-3">
      <Slider
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        onChange={(_, value) => onChange(value as number)}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
        sx={{ zIndex: Z_INDEX.BASE }}
      />
    </div>
  );
};

export default WidthSlider;

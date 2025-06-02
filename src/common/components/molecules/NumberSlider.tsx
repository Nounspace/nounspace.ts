import React from "react";
import { Slider } from "@mui/material";

export interface NumberSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const NumberSlider: React.FC<NumberSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  className,
}) => {
  return (
    <div className={className ?? "ml-3 mr-3"}>
      <Slider
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(_, v) => onChange(v as number)}
      />
    </div>
  );
};

export default NumberSlider;

import React from "react";
import { Slider } from "@mui/material";

export type ImageScaleSliderProps = {
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
};

const ImageScaleSlider: React.FC<ImageScaleSliderProps> = ({
  min = 0.2,
  max = 3,
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
      />
    </div>
  );
};

export default ImageScaleSlider;

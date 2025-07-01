import React from "react";
import { Slider } from "@mui/material";
import { Z_INDEX } from "@/common/constants/zIndex";

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
        sx={{ zIndex: Z_INDEX.BASE }}
      />
    </div>
  );
};

export default ImageScaleSlider;

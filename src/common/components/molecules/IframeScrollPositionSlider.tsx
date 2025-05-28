import React from "react";
import WidthSlider, { WidthSliderProps } from "@/common/components/molecules/ScaleSliderSelector";

const IframeScrollPositionSlider: React.FC<Omit<WidthSliderProps, "min" | "max" | "step">> = (props) => {
  return <WidthSlider {...props} min={0} max={1000} step={10} />;
};

export default IframeScrollPositionSlider;

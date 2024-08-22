import React from "react";
import WidthSlider, {
  WidthSliderProps,
} from "@/common/components/molecules/ScaleSliderSelector";

const IFrameWidthSlider: React.FC<Omit<WidthSliderProps, "min">> = (props) => {
  return <WidthSlider {...props} min={0.5} />;
};

export default IFrameWidthSlider;

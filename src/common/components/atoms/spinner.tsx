import React from "react";

import { FidgetSpinner, Style } from "react-loader-spinner";

type SpinnerProps = {
  style?: Style;
  className?: string;
  color?: string;
  ballColors?: [string, string, string];
};

export default function Spinner({
  style,
  className,
  color,
  ballColors,
}: SpinnerProps) {
  
  return (
    <FidgetSpinner
      backgroundColor={color || "#ffffff"} // Default color to white instead of green
      ballColors={ballColors} // Ball colors default to red, blue, yellow
      wrapperStyle={style}
      wrapperClass={className}
    />
  );
}

export type { SpinnerProps };

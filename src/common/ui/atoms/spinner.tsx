import React from "react";

import { FidgetSpinner, Style } from "react-loader-spinner";

type SpinnerProps = {
  style?: Style;
  className?: string;
};

export default function Spinner({ style, className }: SpinnerProps) {
  return (
    <FidgetSpinner 
      backgroundColor="#ffffff"
      wrapperStyle={style}
      wrapperClass={className}
    />
  );
}

export type { SpinnerProps };
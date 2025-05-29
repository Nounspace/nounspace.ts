import React from "react";

interface Props {
  getText: () => string;
}

export const CastLengthIndicator: React.FC<Props> = ({ getText }) => {
  const length = getText().length;
  return <span className="text-xs opacity-60">{length}</span>;
};

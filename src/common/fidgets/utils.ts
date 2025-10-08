import type { FidgetProperties } from "@/common/fidgets";

const clampSize = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getInitialGridSize = (properties: FidgetProperties) => {
  const width = clampSize(
    properties.defaultSize?.width ?? properties.size.minWidth,
    properties.size.minWidth,
    properties.size.maxWidth,
  );
  const height = clampSize(
    properties.defaultSize?.height ?? properties.size.minHeight,
    properties.size.minHeight,
    properties.size.maxHeight,
  );

  return { width, height };
};
